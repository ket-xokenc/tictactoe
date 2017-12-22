import express from 'express';
import bodyParser from 'body-parser';
import router from './router';

const PORT = process.env.PORT || 4445;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ message: err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`Bot started on port ${PORT}!`);
});
