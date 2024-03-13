const inputs = document.querySelectorAll("input");
const button = document.querySelector(".btn");

// iterate over all inputs
inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {
    // This code gets the current input element and stores it in the currentInput variable
    // This code gets the next sibling element of the current input element and stores it in the nextInput variable
    // This code gets the previous sibling element of the current input element and stores it in the prevInput variable
    const currentInput = input; // current input element
    const nextInput = input.nextElementSibling; // next input element sibling
    const prevInput = input.previousElementSibling; // prev input element sibling

    // if the value has more than one character then clear it
    if (currentInput.value.length > 1) {
      currentInput.value = "";
      return;
    }
    // if the next input is disabled and the current value is not empty
    //  enable the next input and focus on it
    if (
      nextInput &&
      nextInput.hasAttribute("disabled") &&
      currentInput.value !== ""
    ) {
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }

    // if the backspace key is pressed
    if (e.key === "Backspace") {
      // iterate over all inputs again
      inputs.forEach((input, index2) => {
        // if the index1 of the current input is less than or equal to the index2 of the input in the outer loop
        // and the previous element exists, set the disabled attribute on the input and focus on the previous element
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled", true);
          input.value = "";
          prevInput.focus();
        }
      });
    }
    //if the fourth input( which index number is 3) is not empty and has not disable attribute then
    //add active class if not then remove the active class.
    if (!inputs[3].disabled && inputs[3].value !== "") {
      button.classList.add("active");
      return;
    }
    button.classList.remove("active");
  });
});

//focus the first input which index is 0 on window load
window.addEventListener("load", () => inputs[0].focus());

// window.addEventListener("load",resendOTP()

function resendOTP() {
  const email = document.querySelector('input[name="email"]').value;
  console.log("email", email);
  const resendLink = document.getElementById("resendLink");
  console.log("resend", resendLink);
  const countdownElement = document.getElementById("countdown");
  console.log("count", countdownElement);
  const expirationMessageElement = document.getElementById("expirationMessage");
  console.log("expration", expirationMessageElement);
  resendLink.style.pointerEvents = "none";

  fetch("/resendOtp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
      // You can update the UI here if needed
    })
    .catch((error) => {
      console.error("Error:", error);
      // Handle error if needed
    });

  // Set the timer for 30 seconds
  let seconds = 60;
  let countdownInterval = setInterval(() => {
    seconds--;

    // Update the countdown display
    countdownElement.textContent = `OTP expires in ${seconds} seconds`;
    // expirationMessageElement.textContent = `You Can Resend OTP after The Expiration...!`;

    // Check if the countdown has reached 0
    if (seconds <= 0) {
      // Enable the resend link and clear the interval
      resendLink.style.pointerEvents = "auto";
      countdownElement.textContent = "";
      expirationMessageElement.textContent = "";
      clearInterval(countdownInterval);

      fetch("/deleteExpiredOtps", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          // You can handle the server response here if needed
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error if needed
        });
    }
  }, 1000);
}

// Initial countdown time
function startTimer() {
  const email = document.querySelector('input[name="email"]').value;
  let seconds = 60;
  const countdown = document.getElementById("count");

  setTimeout(function () {
    document.getElementById("timer").textContent = "OTP Expired";
  }, seconds * 1000);

  // Update the countdown every second
  const countdownInterval = setInterval(function () {
    seconds--;
    document.getElementById("count").textContent = seconds;

    if (seconds <= 0) {
      clearInterval(countdownInterval);

      // Use fetch to delete expired OTPs
      fetch("/deleteExpiredOtps", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data.message);
        
        })
        .catch((error) => {
          console.error("Fetch error:", error.message);
       
        });
    }
  }, 1000);
}

