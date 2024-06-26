// create an exception class to handle errors inherited from Error

export class Exception extends Error {
  constructor(message: string, name: string) {
    super(message); // Call the constructor of the Error class.
    this.name = name; // Set the name property to the custom error's name.
    Object.setPrototypeOf(this, Exception.prototype); // Set the prototype explicitly.
  }
}

export class NotFoundException extends Exception {
  constructor(selector: string, message: string) {
    super(message, `${selector} NotFoundException`);
  }
}
