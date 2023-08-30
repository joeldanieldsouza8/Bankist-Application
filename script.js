'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

/////////////////////////////////////////////////////////////////////////////////////////////////

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerMovementsDates = document.querySelector('.movements__date');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////

let currentAccount;

const formatMovementDate = (date, locale) => {
  // Here we use the 'Intl.DateTimeFormat' constructor to create a new date formatter
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)); // Here we use the 'Math.round' method to round the result of the division to the nearest integer

  const daysPassed = calcDaysPassed(new Date(), date); // Here we use the 'new Date()' constructor to create a new date object

  if (daysPassed === 0) {
    return 'Today';
  }

  if (daysPassed === 1) {
    return 'Yesterday';
  }

  if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  }

  // Here we use the 'Intl.DateTimeFormat' constructor to create a new date formatter
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Make use of containerMovementsDates
const displayMovements = (account, sort = false) => {
  containerMovements.innerHTML = ''; // Here we use the 'innerHTML' property to set the HTML content of the containerMovements element to an empty string

  // Here we use the 'slice' method to create a shallow copy of the movements array of the account object
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b) // Here we use the 'sort' method to sort the movements array of the account object in ascending order
    : account.movements;

  // Here we use the 'forEach' method to loop over each movement of the movs array
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal'; // Here we use the 'ternary' operator to set the type of the movement

    // Here we use the 'Intl.NumberFormat' constructor to create a new number formatter
    const formattedMov = formatCur(mov, account.locale, account.currency); // Here we use the 'formatCur' function to format the movement

    // Here we use the 'Intl.DateTimeFormat' constructor to create a new date formatter
    const date = new Date(account.movementsDates[i]); // Here we use the 'new Date()' constructor to create a new date object
    const displayDate = formatMovementDate(date, account.locale); // Here we use the 'formatMovementDate' function to format the date

    // Here we use the 'insertAdjacentHTML' method to insert the HTML content into the containerMovements element
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div> 
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html); // Here we use the 'afterbegin' position to insert the HTML content into the containerMovements element
  });
} 

const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0); // Here we use the 'reduce' method to calculate the balance of the account
  labelBalance.textContent = `${formatCur(
    account.balance,
    account.locale,
    account.currency
  )} `; // Here we use the 'formatCur' function to format the balance of the account
};

const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0); // Here we use the 'filter' and 'reduce' methods to calculate the incomes of the account
  labelSumIn.textContent = `${formatCur(
    incomes,
    account.locale,
    account.currency
  )} `; // Here we use the 'formatCur' function to format the incomes of the account

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0); // Here we use the 'filter' and 'reduce' methods to calculate the out of the account
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    account.locale,
    account.currency
  )} `; // Here we use the 'formatCur' function to format the out of the account

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0); // Here we use the 'filter', 'map' and 'reduce' methods to calculate the interest of the account
  labelSumInterest.textContent = `${formatCur(
    interest,
    account.locale,
    account.currency
  )} `; // Here we use the 'formatCur' function to format the interest of the account
};

const createUsernames = accs => {
  // Here we use the 'forEach' method instead of the 'map' method because we don't want to create a new array, we just want to mutate the original array
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

createUsernames(accounts);

// Update UI
const updateUI = account => {
  // Display movements
  displayMovements(account);

  // Display balance
  calcDisplayBalance(account);

  // Display summary
  calcDisplaySummary(account);
};

// Clear input fields and remove focus from input fields
const clearAndBlurInputFields = () => {
  // Clear input fields
  inputCloseUsername.value = inputClosePin.value = inputLoanAmount.value = '';
  inputTransferAmount.value = inputTransferTo.value = '';
  inputLoginUsername.value = inputLoginPin.value = '';

  // Remove focus from input fields
  inputCloseUsername.blur();
  inputClosePin.blur();
  inputLoanAmount.blur();
  inputTransferAmount.blur();
  inputTransferTo.blur();
  inputLoginUsername.blur();
  inputLoginPin.blur();
};

// Event handlers
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  // Here we use the 'find' method to find the account with the username entered in the inputLoginUsername element
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  // Here we use the 'optional chaining' operator to check if the currentAccount exists and if the pin entered in the inputLoginPin element is equal to the pin of the currentAccount
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`; // Here we use the 'split' method to split the owner of the currentAccount into an array of strings, then we use the '[]' operator to get the first element of the array, then we use the 'textContent' property to set the text content of the labelWelcome element
    containerApp.style.opacity = 100; // Here we use the 'style' property to set the opacity of the containerApp element

    // Create current date and time
    const now = new Date(); // Here we use the 'new Date()' constructor to create a new date object
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // numeric, 2-digit
      year: 'numeric', // numeric, 2-digit
      weekday: 'long', // short, narrow
    };

    // Here we use the 'Intl.DateTimeFormat' constructor to create a new date formatter
    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    ); // Here we use the 'format' method to format the date and time

    // Clear input fields and remove focus from input fields
    clearAndBlurInputFields();

    // Update UI
    updateUI(currentAccount);
  } else {
    alert('Invalid username or PIN');
    return;
  }
});

// calcDisplayBalance(account1.movements);

// calcDisplaySummary(account1.movements);

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Clear input fields and remove focus from input fields
  clearAndBlurInputFields();

  // Check if the amount is valid
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString()); // Here we use the 'new Date()' constructor to create a new date object, then we use the 'toISOString' method to convert the date object to a string
    receiverAccount.movementsDates.push(new Date().toISOString()); // Here we use the 'new Date()' constructor to create a new date object, then we use the 'toISOString' method to convert the date object to a string

    // Update UI
    updateUI(currentAccount);
  } else {
    alert('Invalid transfer');
    return;
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); // Here we use the 'Math.floor' method to round down the amount entered in the inputLoanAmount element

  // Clear input fields and remove focus from input fields
  clearAndBlurInputFields();

  // Check if the amount is valid
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // The 'some' method returns true if at least one element in the array satisfies the condition in the callback function passed to the 'some' method
    // Add movement
    currentAccount.movements.push(amount);

    // Add loan date
    currentAccount.movementsDates.push(new Date().toISOString()); // Here we use the 'new Date()' constructor to create a new date object, then we use the 'toISOString' method to convert the date object to a string

    // Update UI
    updateUI(currentAccount);
  } else {
    alert('Invalid loan');
    return;
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  // Check if the username and pin are valid
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    // Delete account
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  } else {
    alert('Invalid username or PIN');
    return;
  }

  // Clear input fields and remove focus from input fields
  clearAndBlurInputFields();
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted); // Here we use the '!' operator to reverse the value of the 'sorted' variable
  sorted = !sorted; // Here we use the '!' operator to reverse the value of the 'sorted' variable
});



labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // Here we use the 'forEach' method to loop over each row of the movements table
    if (i % 2 === 0) {
      // Here we use the 'style' property to set the background color of the row
      row.style.backgroundColor = 'orangered';
    } else {
      row.style.backgroundColor = 'blue';
    }
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////

// Practice Section

// Strings - sorting
// const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort()); // Here we use the 'sort' method to sort the owners array in ascending order

// Numbers - sorting (ascending)
// movements.sort((a,b) => {
//   if(a > b) {
//     return 1;
//   }

//   if(b > a) {
//     return -1;
//   }
// });
// console.log(movements);

// Numbers - sorting (descending)
// movements.sort((a,b) => {
//   if(a < b) {
//     return 1;
//   }

//   if(b < a) {
//     return -1;
//   }
// });
// console.log(movements);

// Using the 'Array()' constructor to create arrays
// const arr = Array(); // Here we use the 'Array()' constructor to create an empty array

// Empty arrays + fill method
// const x = new Array(7); // Here we use the 'Array()' constructor to create an empty array with 7 elements
// x.fill(1, 3, 5); // Here we use the 'fill' method to fill the x array with 1s from the 3rd element to the 5th element
// console.log(x);

// Conversion
// console.log(Number('23')); // Here we use the 'Number' function to convert the string '23' to a number
// console.log(+'23'); // Here we use the '+' operator to convert the string '23' to a number

// Parsing
// The radix is the base of the number system. For example, the radix of the decimal number system is 10, the radix of the binary number system is 2, the radix of the hexadecimal number system is 16, etc.
// console.log(Number.parseInt('30px', 10)); // Here we use the 'Number.parseInt' function to convert the string '30px' to a number
// console.log(Number.parseInt('e23', 10)); // This would throw an error because the string 'e23' cannot be converted to a number
// console.log(parseInt("1101", 2));  // Outputs: 13 (because it's treated as a binary number)
