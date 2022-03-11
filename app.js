let customerRollingId = 1;
const statinIdPrefix = 'checkout-';
const waitingQueue = [];
const checkouts = [
    {id: 1, person: undefined, type: 'seller', serviceTimeInSeconds: '3'},
    {id: 2, person: undefined, type: 'seller', serviceTimeInSeconds: '3'},
    {id: 3, person: undefined, type: 'seller', serviceTimeInSeconds: '3'},
    {id: 4, person: undefined, type: 'seller', serviceTimeInSeconds: '3'},
    {id: 5, person: undefined, type: 'seller', serviceTimeInSeconds: '3'},
    {id: 6, person: undefined, type: 'pda', serviceTimeInSeconds: '4'},
    {id: 7, person: undefined, type: 'hand', serviceTimeInSeconds: '7'},
]

addCheckout = () => {
    const person = {type: 'seller'};
    const freeCheckout = hasFreeCheckout(person.type);

    addPerson(person, freeCheckout);
}

addSelfService = () => {
    const person = {type: 'selfService'};
    const freeCheckout = hasFreeCheckout(person.type);

    addPerson(person, freeCheckout);
}

addPerson = (person, checkout) => {
    person.id = customerRollingId++;

    if (checkout) {
        checkout.person = person;
        document.querySelector(`#${statinIdPrefix}${checkout.id}`).appendChild(getPersonHTMLElement(person));

        putProduct(checkout)
            .then(checkout => {
                removePersonFromCheckout(checkout);
                callNextPerson(checkout);
            });
    } else {
        addPersonToWaitingQueue(person);
    }

    console.log(checkouts, waitingQueue)
}

addPersonToWaitingQueue = person => {
    document.querySelector(`#queue`).appendChild(getPersonHTMLElement(person));

    waitingQueue.push(person);
}

getPersonHTMLElement = person => {
    const personElement = document.createElement('div');
    personElement.classList = 'person-item'
    personElement.id = `person-${person.id}`;

    personElement.innerHTML = `<span class="material-icons">${person.type === 'seller' 
    ? 'face' : 'display_settings'}</span><span>${person.id}</span>`;

    return personElement;
}

putProduct = (checkout) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(checkout);
        }, checkout.serviceTimeInSeconds * 1000);
    });
}

callNextPerson = checkout => {
    const person = getWaitingPerson(checkout.type);

    if (person !== undefined) {
        addPerson(person, checkout);
    }
}

getWaitingPerson = checkoutType => {
    let person = undefined;

    if (checkoutType === 'pda' || checkoutType === 'hand') {
        person = waitingQueue.find(person => person.type === 'selfService');
    } else {
        person = waitingQueue.find(person => person.type === 'seller');
    }

    if (person !== undefined) {
        document.querySelector(`#person-${person.id}`).remove();
        waitingQueue.splice(waitingQueue.indexOf(person), 1);
    }

    return person;
}

removePersonFromCheckout = (checkout) => {
    checkout.person = undefined;
    document.querySelector(`#${statinIdPrefix}${checkout.id}`).innerHTML = '';
}

hasFreeCheckout = type => {
    return checkouts
        .find(checkout => checkout.person === undefined
            && (checkout.type === type || (type === 'selfService' && (checkout.type === 'pda' || checkout.type === 'hand' ))));
}