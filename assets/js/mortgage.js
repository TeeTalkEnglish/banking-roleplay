(function () {
    "use strict";

    const money = new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0
    });

    const getNumber = (id) => {
        const field = document.getElementById(id);
        return field ? Number(field.value) || 0 : 0;
    };

    const setText = (id, value) => {
        const output = document.getElementById(id);
        if (output) {
            output.textContent = value;
        }
    };

    function calculateDepositChallenge() {
        const price = getNumber("deposit-house-price");
        setText("deposit-5", money.format(price * 0.05));
        setText("deposit-10", money.format(price * 0.10));
        setText("deposit-20", money.format(price * 0.20));
    }

    function calculateMortgage() {
        const housePrice = getNumber("mortgage-house-price");
        const deposit = getNumber("mortgage-deposit");
        const annualRate = getNumber("mortgage-interest-rate") / 100;
        const loanYears = getNumber("mortgage-loan-years");
        const loanAmount = Math.max(housePrice - deposit, 0);
        const months = loanYears * 12;
        const monthlyRate = annualRate / 12;
        let monthlyRepayment = 0;

        if (loanAmount > 0 && months > 0) {
            if (monthlyRate === 0) {
                monthlyRepayment = loanAmount / months;
            } else {
                monthlyRepayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
            }
        }

        setText("mortgage-deposit-output", money.format(deposit));
        setText("mortgage-loan-output", money.format(loanAmount));
        setText("mortgage-monthly-output", money.format(monthlyRepayment));
        setText("mortgage-interest-output", money.format((monthlyRepayment * months) - loanAmount));
        setText("mortgage-total-output", money.format(monthlyRepayment * months));
    }

    document.addEventListener("DOMContentLoaded", () => {
        const depositInputs = document.querySelectorAll("[data-deposit-calculator]");
        const mortgageInputs = document.querySelectorAll("[data-mortgage-calculator]");

        depositInputs.forEach((input) => {
            input.addEventListener("input", calculateDepositChallenge);
        });

        mortgageInputs.forEach((input) => {
            input.addEventListener("input", calculateMortgage);
        });

        calculateDepositChallenge();
        calculateMortgage();
    });
})();
