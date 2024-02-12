const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const dbConnect = require('./config/dbConnect');
const authRouter = require('./routes/authRoute');
const { errorHandler, notFound } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookieParser())

dbConnect()

app.use('/api/user', authRouter)

app.use(errorHandler)
app.use(notFound)

// app.use((req, res, next) => {
//   next(createError.NotFound());
// });

// app.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.send({
//     status: err.status || 500,
//     message: err.message,
//   });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
