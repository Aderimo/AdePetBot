# Shared Infrastructure Utilities

Bu modül, AdePetBot Complete Game System için paylaşılan altyapı yardımcı programlarını içerir.

## Modüller

### 1. Config (`config.js`)

Environment değişkenlerini yükler ve doğrular.

**Özellikler:**
- Gerekli environment değişkenlerinin varlığını kontrol eder
- Tip ve format doğrulaması yapar
- Production ortamında güvenlik uyarıları verir

**Kullanım:**
```javascript
import config from './shared/config.js';

console.log(config.discord.token);
console.log(config.database.url);
console.log(config.isProduction);
```

### 2. Logger (`logger.js`)

Yapılandırılmış JSON logging ve correlation ID desteği.

**Özellikler:**
- Development'ta pretty print, production'da JSON format
- Correlation ID desteği ile request tracking
- Error stack trace otomatik yakalama
- Log seviyeleri: error, warn, info, debug

**Kullanım:**
```javascript
import logger from './shared/logger.js';

logger.info('Server started', { port: 3000 });
logger.error('Database error', { error: err, playerId: '123' });

// Correlation ID ile child logger
const requestLogger = logger.child('req-uuid-123');
requestLogger.info('Processing request');
```

### 3. Errors (`errors.js`)

Tip güvenli uygulama hataları.

**Özellikler:**
- Standart hata formatı (error_code, message, timestamp, context)
- HTTP status code desteği
- Oyun-spesifik hata tipleri

**Kullanım:**
```javascript
import { 
  ValidationError, 
  NotFoundError, 
  InsufficientResourcesError 
} from './shared/errors.js';

// Validation hatası
throw new ValidationError('Invalid pet ID');

// Resource bulunamadı
throw new NotFoundError('Pet', petId);

// Yetersiz kaynak
throw new InsufficientResourcesError('Shadow Shards', 5, 2);
```

**Hata Tipleri:**
- `ValidationError` (400) - Geçersiz input
- `AuthenticationError` (401) - Kimlik doğrulama gerekli
- `AuthorizationError` (403) - Yetersiz izin
- `NotFoundError` (404) - Kaynak bulunamadı
- `ConflictError` (409) - Çakışma (duplicate, race condition)
- `RateLimitError` (429) - Rate limit aşıldı
- `InsufficientResourcesError` (400) - Yetersiz kaynak
- `InventoryFullError` (400) - Envanter dolu
- `MissingPrerequisiteError` (400) - Eksik ön koşul
- `InvalidStateError` (400) - Geçersiz durum (locked, listed, vb.)
- `DatabaseError` (500) - Veritabanı hatası
- `ExternalServiceError` (502) - Harici servis hatası

### 4. Random (`random.js`)

Kriptografik olarak güvenli rastgele sayı üretimi (Node crypto kullanarak).

**Özellikler:**
- Spawn ve drop hesaplamaları için güvenli RNG
- Çeşitli yardımcı fonksiyonlar
- Ağırlıklı seçim desteği

**Kullanım:**
```javascript
import { 
  randomFloat, 
  randomInt, 
  rollProbability, 
  weightedChoice 
} from './shared/random.js';

// 0-1 arası float
const chance = randomFloat();

// 1-100 arası integer
const roll = randomInt(1, 100);

// Olasılık kontrolü
if (rollProbability(0.001)) {
  console.log('Secret rarity spawned!');
}

// Ağırlıklı seçim
const rarity = weightedChoice([
  { item: 'common', weight: 70 },
  { item: 'rare', weight: 25 },
  { item: 'legendary', weight: 5 },
]);
```

**Fonksiyonlar:**
- `randomFloat()` - [0, 1) arası float
- `randomInt(min, max)` - [min, max] arası integer
- `rollProbability(prob)` - 0-1 olasılık kontrolü
- `rollPercentage(pct)` - 0-100 yüzde kontrolü
- `randomChoice(array)` - Diziden rastgele seçim
- `weightedChoice(items)` - Ağırlıklı seçim
- `shuffle(array)` - Fisher-Yates karıştırma
- `randomUUID()` - UUID v4 üretimi
- `randomHex(bytes)` - Hex string üretimi

### 5. Cache (`cache.js`)

Redis-uyumlu in-memory cache adapter.

**Özellikler:**
- Redis komut seti ile uyumlu interface
- TTL (time-to-live) desteği
- Cache istatistikleri (hit rate, vb.)
- Otomatik expired entry temizleme

**Kullanım:**
```javascript
import { createCache } from './shared/cache.js';

const cache = createCache();

// Set ve get
await cache.set('player:123', JSON.stringify(playerData));
const data = await cache.get('player:123');

// TTL ile set
await cache.set('session:abc', sessionData, 3600); // 1 saat

// Increment/decrement
await cache.incr('daily_logins');

// İstatistikler
const stats = cache.getStats();
console.log(stats.hitRate); // "85.50%"
```

**Redis-uyumlu Komutlar:**
- `get(key)` - Değer al
- `set(key, value, ttl?)` - Değer kaydet
- `setex(key, seconds, value)` - TTL ile kaydet
- `del(key)` - Sil
- `exists(key)` - Varlık kontrolü
- `expire(key, seconds)` - TTL ayarla
- `ttl(key)` - Kalan süre
- `incr(key)` - Artır
- `decr(key)` - Azalt
- `flushall()` - Tümünü temizle

### 6. Correlation (`correlation.js`)

Request tracking için correlation ID yönetimi.

**Özellikler:**
- Otomatik correlation ID üretimi
- X-Correlation-ID header desteği
- Logger entegrasyonu

**Kullanım:**
```javascript
import { correlationMiddleware } from './shared/correlation.js';

// Express middleware olarak
app.use(correlationMiddleware());

// Route'larda kullanım
app.get('/api/pets', (req, res) => {
  const logger = req.logger; // Correlation ID'li logger
  logger.info('Fetching pets');
  // ...
});
```

### 7. API Response (`api-response.js`)

Standart API response helpers.

**Özellikler:**
- Tutarlı success/error response formatı
- Otomatik error logging
- Async route wrapper

**Kullanım:**
```javascript
import { 
  sendSuccess, 
  sendError, 
  errorHandler, 
  asyncHandler 
} from './shared/api-response.js';

// Success response
app.get('/api/pets', asyncHandler(async (req, res) => {
  const pets = await petService.list();
  sendSuccess(res, { pets });
}));

// Error handling
app.use(errorHandler());
```

## Requirements Coverage

Bu modül aşağıdaki gereksinimleri karşılar:

- **Req 2.6**: Cryptographically secure random number generation
- **Req 16.5**: Cache interface compatible with Redis
- **Req 17.5**: Standardized error responses
- **Req 25.1**: Environment validation and structured logging
- **Req 25.2**: Error categorization
- **Req 25.4**: Correlation IDs for request tracking

## Test Coverage

Tüm modüller kapsamlı unit testlere sahiptir:
- `tests/shared/random.test.js` - Random helpers
- `tests/shared/cache.test.js` - Cache adapter
- `tests/shared/errors.test.js` - Error types

Testleri çalıştırmak için:
```bash
npm test
```
