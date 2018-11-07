
export function getBalance_response(user, location, unit, balance) {
  let response = new Object({});
  response.command = 'getBalance_RES';
  response.user = user;
  response.location = location;
  response.unit = unit;
  response.balance = balance;
  response.status = 0;
  return JSON.stringify(response);
}

export function empty_response(command) {
  let response = new Object({});
  response.command = command + '_RES';
  response.status = 0;
  return JSON.stringify(response);
}

export function data_response(command, data) {
  let response = new Object({});
  response.command = command + '_RES';
  response.status = 0;
  response.data = JSON.stringify(data);
  return JSON.stringify(response);
}

export function error_response(command, error_message) {
  let response = new Object({});
  response.command = command + '_RES';
  response.status = 1;
  response.status_err = error_message;
  return JSON.stringify(response);
}
