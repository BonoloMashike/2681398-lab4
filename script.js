const input = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const spinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

function showSpinner() {
    spinner.classList.remove('hidden');
}

function hideSpinner() {
    spinner.classList.add('hidden');
}

function clearUI() {
    countryInfo.innerHTML = '';
    borderingCountries.innerHTML = '';
    errorMessage.textContent = '';
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

async function fetchBorderCountries(borders) {
    const borderPromises = borders.map(code =>
        fetch(`https://restcountries.com/v3.1/alpha/${code}`)
            .then(res => res.json())
    );

    const borderData = await Promise.all(borderPromises);

    borderingCountries.innerHTML = '';

    borderData.forEach(data => {
        const country = data[0];

        const card = document.createElement('div');
        card.classList.add('border-card');

        card.innerHTML = `
            <h4>${country.name.common}</h4>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;

        borderingCountries.appendChild(card);
    });

    borderingCountries.classList.remove('hidden');
}

async function searchCountry(countryName) {
    if (!countryName.trim()) {
        errorMessage.textContent = 'Please enter a country name.';
        errorMessage.classList.remove('hidden');
        return;
    }

    clearUI();
    showSpinner();

    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);

        if (!response.ok) {
            throw new Error('Country not found.');
        }

        const data = await response.json();
        const country = data[0];

        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;

        countryInfo.classList.remove('hidden');

        if (country.borders && country.borders.length > 0) {
            await fetchBorderCountries(country.borders);
        } else {
            borderingCountries.innerHTML = '<p>No bordering countries.</p>';
            borderingCountries.classList.remove('hidden');
        }

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        hideSpinner();
    }
}

searchBtn.addEventListener('click', () => {
    searchCountry(input.value);
});

input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchCountry(input.value);
    }
});