let cart = [];
let currentUser = null;
let nextAppointment = null;
let orderValue = 0;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-link').forEach(link => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
          openModal(link.getAttribute('href').substring(1));
      });
  });

  const appntDisplay1 = document.getElementById('appointmentalertid'); 
      appntDisplay1.hidden = true;

  document.getElementById('doctor').addEventListener('change', function() {
      showDoctorPic(this.value);
  });
});

//let cart = [];

function showScreen(screenId) {
  document.querySelectorAll('section').forEach(section => {
      section.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  
  if (screenId === 'checkout') {
      populateCheckout();
  }
}

function addToCart(item, price) {
  cart.push({ item, price });
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  const totalAmount = document.getElementById('totalAmount');
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach(cartItem => {
      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'cart-item';
      cartItemDiv.innerHTML = `
          <h3>${cartItem.item}</h3>
          <p>Rs ${cartItem.price}</p>
          <button onclick="removeFromCart('${cartItem.item}')">Remove</button>
      `;
      cartItems.appendChild(cartItemDiv);
      total += cartItem.price;
  });
  orderValue = total;
  totalAmount.textContent = total;
}

function removeFromCart(item) {
  cart = cart.filter(cartItem => cartItem.item !== item);
  updateCart();
}

function checkout() {
  showScreen('checkout');
}

function populateCheckout() {
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
  checkoutItems.innerHTML = '';
  let total = 0;

  cart.forEach(cartItem => {
      const checkoutItemDiv = document.createElement('div');
      checkoutItemDiv.className = 'checkout-item';
      checkoutItemDiv.innerHTML = `
          <h3>${cartItem.item}</h3>
          <p>Rs ${cartItem.price}</p>`
      
      checkoutItems.appendChild(checkoutItemDiv);
      total += cartItem.price;
  });

  orderValue = total;
  checkoutTotalAmount.textContent = total;
  
}
/*
function confirmCheckout(event) {
  event.preventDefault();
  alert('Order received. Thank you!');
  cart = []; 
  updateCart(); 
  showScreen('pharmacy'); 
}
*/

document.getElementById('checkoutForm').addEventListener('submit', confirmCheckout);


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rbody = JSON.stringify({ username, password });
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rbody
      });
  
      if (!response.ok) {
        currentUser = "No User";
        const userNameDisplay = document.getElementById('username1'); // Get the input element
        userNameDisplay.value = currentUser; // Set the value of the input
        const errorData = await response.json(); // Parse error details (if JSON)
        const errorMessage = `Login failed with status ${response.status}`;
        if (errorData && errorData.message) {
          errorMessage += `: ${errorData.message}`; // Add error message from response
        }
        throw new Error(errorMessage);
      }
  
      const responseData = await response.json();
  
      if (responseData.success) {
        console.log('Login successful!');
        currentUser = username;
        //updateNextAppnt();
        //Get next appointment
        /*const url = '/get-next-appointment?currentuser=' + currentUser;
        const response = await fetch(url).then(response => response.json());
        nextAppointment = response.apntdatetime;
        const appntDisplay = document.getElementById('appointmentalertid');
        appntDisplay.value = nextAppointment;
*/
        const userNameDisplay = document.getElementById('username1'); // Get the input element
        userNameDisplay.value = currentUser; // Set the value of the input

      }
  
      closeModal('loginModal');
      showScreen('booking');
    } catch (error) {
      console.error('Login Error:', error.message);
      closeModal('loginModal');
      // **Create and display modal popup with error message:**
      const modal = document.createElement('div'); // Create modal element
      modal.classList.add('error-modal'); // Add CSS class for styling
  
      const modalContent = document.createElement('div'); // Create modal content container
      modalContent.classList.add('modal-content');
      modalContent.textContent = error.message; // Set error message content
  
      const closeButton = document.createElement('button'); // Create close button
      closeButton.textContent = 'Close';
      closeButton.addEventListener('click', () => {
        modal.remove(); // Remove modal on close button click
      });
  
      modalContent.appendChild(closeButton); // Add close button to modal content
      modal.appendChild(modalContent); // Add modal content to modal
  
      document.body.appendChild(modal); // Add modal to body
  
      // Make the modal act like a modal (optional):
      modal.addEventListener('click', (event) => {
        if (event.target === modal) { // Close modal if clicked outside the content area
          modal.remove();
        }
      });
    }
  });
  

document.getElementById('registerModal').addEventListener('submit', function(event) {
    //event.preventDefault();
	
	const registerForm = document.getElementById('registerForm');
	const username = document.getElementById('regUsername').value;
	const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const rbody = JSON.stringify({ username, email, password });
	const response = fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: rbody        });

        // Check response status
        if (!response.ok) {
          throw new Error('Registration failed with status ${response.status}');
        }

        // Parse response data (assuming JSON response)
        const responseData =  response.json();

        if (responseData.success) {
          console.log('Registration successful!');
		}
	
    closeModal('registerModal');
    alert('Registration successful!');
});

document.getElementById('appointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const aname = document.getElementById('aname').value;
    const aemail = document.getElementById('aemail').value;
    const phone = document.getElementById('phone').value;
    const adate = document.getElementById('adate').value;
    const atime = document.getElementById('atime').value;
    const doctor = document.getElementById('doctor').value;
    const rbody = JSON.stringify({ currentUser,aname, aemail,phone,adate,atime,doctor });
    const response = fetch('/bookappointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rbody        });
    // Check response status
    if (!response.ok) {
        throw new Error('Appointment booking failed with status ${response.status}');
      }

      // Parse response data (assuming JSON response)
      const responseData =  response.json();

      if (responseData.success) {
        console.log('Appointment booking successful!');
      }
 
     alert('Appointment booked successfully!');
});

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showDoctorPic(doctorId) {
  const doctorInfos = document.querySelectorAll('.doctor-info');
  doctorInfos.forEach(info => {
      info.style.display = 'none';
  });
  document.getElementById(`${doctorId}_info`).style.display = 'block';
}

//Functions to get data and fill the appointments table.

const dataSection = document.getElementById('appointments');
const appTable = document.getElementById('appointmenttable');
const tableBody = document.getElementById('appointmenttablerows');

const observer = new IntersectionObserver(entries => {
   //Remove existing rows
   
   var tableRows = appTable.getElementsByTagName("tbody")[0]; // Get the first tbody element
   if (tableRows) 
      tableRows.innerHTML = "";
  if (entries[0].isIntersecting) {
    fetchDataAndPopulateTable(); // Call function to fetch data and populate table
    //observer.unobserve(dataSection); // Stop observing after first intersection
  }
});


observer.observe(dataSection); // Start observing the data section

async function fetchDataAndPopulateTable() {
    // Implement your logic to fetch data from an API or other source 
    const rbody = JSON.stringify({ currentUser });
    const url = '/get-appointments?currentuser=' + currentUser;
    const response = await fetch(url).then(response => response.json());
    // Loop through data and create table rows
    response.forEach(rowData => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${rowData.name}</td><td>${rowData.doctorname}</td><td>${rowData.date}</td><td>${rowData.time}</td>`; // Assuming data structure
      tableBody.appendChild(row);
    });
}

//Functions to get data and fill the orders table.

const orderSection = document.getElementById('recentOrders');
const orderTable = document.getElementById('ordertable');
const orderBody = document.getElementById('ordertablerows');

const orderobserver = new IntersectionObserver(entries => {
   //Remove existing rows
   
   var tableRows = orderTable.getElementsByTagName("tbody")[0]; // Get the first tbody element
   if (tableRows) 
      tableRows.innerHTML = "";
  if (entries[0].isIntersecting) {
    fetchOrderDataAndPopulateTable(); // Call function to fetch data and populate table
    //observer.unobserve(dataSection); // Stop observing after first intersection
  }
});


orderobserver.observe(orderSection); // Start observing the data section

async function fetchOrderDataAndPopulateTable() {
    // Implement your logic to fetch data from an API or other source 
    const rbody = JSON.stringify({ currentUser });
    const url = '/get-orders?currentuser=' + currentUser;
    const response = await fetch(url).then(response => response.json());
    // Loop through data and create table rows
    response.forEach(rowData => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${rowData.orderitems}</td><td>${rowData.orderdate}</td><td>${rowData.price}</td>`; // Assuming data structure
      orderBody.appendChild(row);
    });
}

//Function to checkout and update order in db
function confirmCheckout(event) {
  event.preventDefault();
  const address = document.getElementById('address').value;
  const ordertotal = orderValue;
  const orderitems = getCartItems();

  const rbody = JSON.stringify({ currentUser,address, ordertotal,orderitems });
  const response = fetch('/orderitems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rbody        });
  // Check response status
  if (!response.ok) {
      throw new Error('Order failed with status ${response.status}');
    }

    // Parse response data (assuming JSON response)
    const responseData =  response.json();

    if (responseData.success) {
      console.log('Order  successful!');
    }

   alert('Order placed successfully!');
};

function getCartItems() {
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
  checkoutItems.innerHTML = '';
  let total = 0;
  let items = '';

  cart.forEach(cartItem => {
      
      total += cartItem.price;
      items+= cartItem.item;
      items+=', '
  });
  return items;
}

//Function to check appointment time every second and raise alert.
function checkNextAppointment() {
  // Your function code here
  updateNextAppnt();
  const formatedappnt = nextAppointment.replace(" ","T");
  const curTime = new Date().getTime();
  const nextapt = new Date(formatedappnt).getTime();
  //const nextaptms = nextapt.getTime();
  if (nextapt) {
    timeDiff  = (nextapt - curTime) / (1000 * 60);
    const appntDisplayE = document.getElementById('appointmentalertid'); 
    if (timeDiff < 60) {
      appntDisplayE.value = "Alert! Your appointment at " + nextAppointment;
      appntDisplayE.hidden = false;
    }
    else
      appntDisplayE.hidden = true;

       
  }

}

async function updateNextAppnt() {
    //Get next appointment
    const url = '/get-next-appointment?currentuser=' + currentUser;
    const response = await fetch(url).then(response => response.json());
    nextAppointment = response.apntdatetime;
    //const appntDisplay = document.getElementById('appointmentalertid');
    //appntDisplay.value = nextAppointment;
}

const intervalId = setInterval(checkNextAppointment, 1000);  // Run every 1 second
