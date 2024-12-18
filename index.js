const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');

const app = express();
const port = 3000;

// Body-parser kullanarak JSON verilerini almak
app.use(bodyParser.json()); 

// RabbitMQ'ya bağlanma ve kanal oluşturma
amqp.connect('amqp://localhost', (err, connection) => {
  if (err) {
    console.error('RabbitMQ bağlantısı başarısız oldu:', err);
    process.exit(1); // Bağlantı hatası durumunda uygulamayı sonlandırıyoruz
  }
  connection.createChannel((err, channel) => {
    if (err) {
      console.error('RabbitMQ kanal oluşturulamadı:', err);
      process.exit(1); // Kanal hatası durumunda uygulamayı sonlandırıyoruz
    }

    const paymentQueue = 'paymentQueue'; // Payment Queue
    const notificationQueue = 'notificationQueue'; // Notification Queue

    // RabbitMQ kuyruğunu oluşturma
    channel.assertQueue(paymentQueue, { durable: true }); // Payment Queue
    channel.assertQueue(notificationQueue, { durable: true }); // Notification Queue

    // /payment endpoint'ine gelen POST isteğini işleme
    app.post('/payment', (req, res) => {
      const paymentDetails = req.body;
      if (!paymentDetails.user || !paymentDetails.paymentType || !paymentDetails.cardNo) {
        console.log('Eksik bilgi: ' + JSON.stringify(paymentDetails)); // Eksik bilgi konsola yazdır
        return res.status(400).send('Eksik bilgi, lütfen tüm bilgileri girin.');
      }

      // Ödeme bilgilerini Payment Queue'ya gönderme
      channel.sendToQueue(paymentQueue, Buffer.from(JSON.stringify(paymentDetails)));
      console.log('Payment added to the queue');
      res.status(200).send('Payment is being processed');
    });

    // Payment Queue'dan mesaj tüketme ve ödeme işleme
    function processPayment() {
      channel.consume(paymentQueue, (msg) => {
        const paymentDetails = JSON.parse(msg.content.toString());
        console.log(`Processing payment for ${paymentDetails.user}`);

        // Ödeme işleme simülasyonu (örneğin, onaylama)
        const notificationMessage = {
          user: paymentDetails.user,
          message: 'Your payment has been received.',
        };

        // Notification Queue'ya mesaj gönderme
        channel.sendToQueue(notificationQueue, Buffer.from(JSON.stringify(notificationMessage)));
        console.log('Sending email to ' + paymentDetails.user);
        console.log('Message: ' + notificationMessage.message);
        channel.ack(msg); // Mesajı başarıyla tükettiğimizi bildiriyoruz
      });
    }

    // Notification Queue'dan mesaj tüketme ve kullanıcıya bildirim gönderme
    function sendNotification() {
      channel.consume(notificationQueue, (msg) => {
        const notification = JSON.parse(msg.content.toString());
        console.log(`Sending email to ${notification.user}`);
        console.log(`Message: ${notification.message}`);
        channel.ack(msg); // Mesajı başarıyla tükettiğimizi bildiriyoruz
      });
    }

    // Payment ve Notification işlemleri başlatma
    processPayment();
    sendNotification();

    // Sunucu başlatma
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('RabbitMQ connected and waiting for messages...');
    });
  });
});
