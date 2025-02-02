const checkEmailAndPasswordFormat = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (!emailRegex.test(email) || !passwordRegex.test(password)) {
        return false;
    }

    return true;
}

const apiCall = (url, method, headers, body) => {
    return fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

export { checkEmailAndPasswordFormat, apiCall };


