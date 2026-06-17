# AdePetBot Master Task List

Bu dokuman, PDF proje dokumani ile `.kiro` altindaki buyuk kapsamli gereksinimleri tek kaynakta birlestirir.

## Karar

Ilk hedef, oynanabilir ve deploy edilebilir bir MVP cikarmaktir:

1. Discord merkezli tek pet ve aktivite ekonomisi.
2. Meslekler, materyal toplama, ekipman, crafting ve market.
3. Web panel ve OAuth.
4. Sonraki fazlarda cok petli koleksiyon, yumurta, evrim, battle, boss, sezon ve abonelik sistemleri.

## Faz 0 - Proje Temizligi ve Deploy Hazirligi

- [x] PDF ve `.kiro` dokumanlarini tek ana plana indir.
- [ ] Bozuk karakterleri ve eski placeholder metinleri temizle.
- [x] Discord komutlarini `src/bot/commands` altina tasi.
- [x] REST route yapisini `src/api` altinda toparla.
- [x] Oyun domain kodlari icin `src/game` sinirini olustur.
- [x] Veritabani erisimi icin `src/db` sinirini olustur.
- [x] Render free deploy icin `render.yaml` ekle.
- [x] Render ortaminda `PORT` env degiskenini destekle.
- [x] `.env.example` dosyasini PostgreSQL ve Render akisi ile uyumlu hale getir.
- [x] Testleri ve Prisma schema dogrulamasini calistir.

## Faz 1 - Calisan Bot ve API Temeli

- [x] Discord client acilis, graceful shutdown ve komut yukleme akisini temizle.
- [x] `/ping` komutu.
- [x] `/yardim` komutu.
- [ ] `/profil` komutunu gercek player verisine bagla.
- [x] `GET /health` endpointini koru.
- [x] `GET /api/v1` ve servis durumu endpointlerini duzenle.
- [x] Tum API requestleri icin correlation ID ve response time logla.
- [x] Standart hata cevaplarini koru.
- [ ] Turkce ve Ingilizce coklu dil altyapisini ekle.

## Faz 2 - Oyuncu, Pet ve Progression

- [ ] Discord user ID ile oyuncu kaydi/yukleme.
- [ ] Kullanici basina baslangic peti.
- [ ] Pet level, XP, mood, rarity ve passive ability.
- [ ] Genel oyuncu level ve XP.
- [ ] Gold ve gem para birimleri.
- [ ] Level-up odulleri.
- [ ] Icerik kilidi acma kurallari.
- [ ] Profil ve pet listeleme API/komutlari.

## Faz 3 - Aktivite, Meslekler ve Anti-Abuse

- [ ] Chat aktivitesinden XP/gold kazanma.
- [ ] Ses kanali aktivitesinden XP/gold kazanma.
- [ ] Anti-AFK kontrolleri.
- [ ] Multi hesap sinyal kaydi.
- [ ] Madencilik level ve materyal sistemi.
- [ ] Balikcilik level ve materyal sistemi.
- [ ] Odunculuk level ve materyal sistemi.
- [ ] Ciftcilik ve yemek pisirme temeli.
- [ ] Meslek XP odulleri.
- [ ] Aktivite loglari ve cooldownlar.

## Faz 4 - Mini Oyunlar

- [ ] Madencilik zamanlama/secim mini oyunu.
- [ ] Balikcilik reaction tabanli mini oyunu.
- [ ] Odunculuk mini oyunu.
- [ ] Mini oyun odul ve basarisizlik kurallari.
- [ ] Anti-abuse icin mini oyun davranis loglari.

## Faz 5 - Envanter, Ekipman ve Crafting

- [ ] Pet, materyal, consumable ve equipment envanteri.
- [ ] Envanter slot limitleri.
- [ ] Ekipman satin alma.
- [ ] Ekipman takma/cikarma.
- [ ] Crafting tarifleri ve materyal dogrulama.
- [ ] Batch crafting.
- [ ] Ekipman upgrade sistemi.
- [ ] Basarisiz upgrade sonucu hasar, seviye dusme veya parcalanma.
- [ ] Ekipman tamir sistemi.
- [ ] Crafting history ve favori tarifler.

## Faz 6 - Ekonomi, Gorev ve Market

- [ ] Gunluk gorevler.
- [ ] Haftalik gorevler.
- [ ] Basarimlar.
- [ ] Global leaderboard.
- [ ] Oyuncu-oyuncu marketplace.
- [ ] Item/pet listeleme kilidi.
- [ ] Satin alma ve transfer transactionlari.
- [ ] Market komisyonu.
- [ ] Blackjack.
- [ ] Slot makinesi.
- [ ] Cark sistemi.
- [ ] Ekonomi denge metrikleri.

## Faz 7 - Web Panel

- [ ] React/Next.js frontend kararini netlestir.
- [ ] Discord OAuth2 login.
- [ ] Profil sayfasi.
- [ ] Pet ve envanter sayfasi.
- [ ] Market sayfasi.
- [ ] Global siralama sayfasi.
- [ ] Admin panel baslangici.
- [ ] Responsive ve erisilebilir arayuz.

## Faz 8 - Sosyal ve Event Sistemleri

- [ ] Arkadas listesi.
- [ ] Guild/takim sistemi.
- [ ] Guild gorevleri.
- [ ] Boss veya ortak event sistemi.
- [ ] Sezonluk gorev ve siralama.
- [ ] Haftalik etkinlikler.

## Faz 9 - Buyuk Genisleme

- [ ] Cok petli koleksiyon sistemi.
- [ ] Yumurta acma.
- [ ] Nadirlik katmanlari: Common, Uncommon, Rare, Epic, Legendary, Mythic, Divine, Secret.
- [ ] Evrim sistemi.
- [ ] Mutasyon sistemi.
- [ ] Bolgeler ve spawn tablolari.
- [ ] Aktif 3 pet takimi.
- [ ] Pet ekipman slotlari.
- [ ] Pet battle, PvE ve PvP.
- [ ] Raid/world boss.
- [ ] Kutu acma.
- [ ] Elmas ledger.
- [ ] Abonelik ve premium shop.

## Teknik Kalite Kapilari

- [ ] Kritik game servisleri icin unit testler.
- [ ] API endpointleri icin integration testler.
- [ ] Discord command handler testleri.
- [x] Prisma schema validation.
- [x] Render deploy smoke test.
- [ ] Guvenlik: input validation, rate limit, CSRF, password hashing gereken yerler.
- [ ] Log retention ve kritik hata bildirim adapterleri.

## Render Free Notlari

- Free web service idle kalinca uyuyabilir ve tekrar acilmasi yaklasik bir dakika surebilir.
- Free web service filesystem kalici degildir; kalici veri icin PostgreSQL gerekir.
- Free Render Postgres 1 GB limitlidir ve 30 gun sonra sona erer.
- Ucretsiz MVP icin uygundur; kalici oyun verisi icin ileride paid Render Postgres, Neon veya Supabase dusunulmelidir.
