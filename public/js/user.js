export function createCredentialString(username, password) {
    let combinedStr = username + ":" + password;
    let b64Str = btoa(combinedStr);

    return "basic " + b64Str;
}

export async function addUser(regusername,regpwd){   
    let url = "/user"
    let credString = createCredentialString(regusername.value, regpwd.value)
    

    let cfg = {
        method: "POST",
        headers: {
            "content-type":"application/json",
            "authorization": credString
        }
    };
    
    try {
        let response = await fetch(url, cfg);
        let data = await response.json();

        if (response.status != 200) {
            throw data.error;
        }

        location.href = "../index.html"
    }
    catch(error) {
        console.log(error);
    }
}