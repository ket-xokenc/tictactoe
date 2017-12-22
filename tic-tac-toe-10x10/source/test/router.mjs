import express from 'express';
import { setError } from './service';
import { testExceptionHandler } from './socket';
import { BadArgumentsError } from '../errors';

const router = new express.Router();

function setTestError(req, res) {
  const { error } = req.body;
  if (!error) {
    throw new BadArgumentsError('"error" is a required field!');
  }
  setError(error);
  if (error.type === 'socket') {
    testExceptionHandler(error);
  }
  res.sendStatus(204);
}

function deleteTestError(req, res) {
  setError();
  res.sendStatus(204);
}
export default router
  .put('/error', setTestError)
  .delete('/error', deleteTestError);
