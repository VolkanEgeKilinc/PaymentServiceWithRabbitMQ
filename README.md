# PaymentServiceWithRabbitMQ

Bu proje, RabbitMQ kullanarak ödeme servisinin temellerini oluşturmak için geliştirilmiştir. Express.js ile oluşturulmuş bir API ve RabbitMQ ile mesajlaşma özelliklerine sahiptir.

## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/VolkanEgeKilinc/PaymentServiceWithRabbitMQ.git
Bağımlılıkları yükleyin:

bash
Kodu kopyala
cd PaymentServiceWithRabbitMQ
npm install
Projeyi başlatın:

bash
Kodu kopyala
npm start
Sunucu, http://localhost:3000 adresinde çalışacaktır.

Kullanım
API Endpoints
RabbitMQ ile ödeme işlemleri gerçekleştirilir.

Proje Yapısı (master kısmında yer almaktadır)
index.js: Ana uygulama dosyası
package.json: Bağımlılıklar ve proje bilgileri
node_modules/: Yüklenen bağımlılıklar
