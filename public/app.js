document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('signin-button').addEventListener('click', function(event) {
    event.preventDefault()
    blockstack.redirectToSignIn(`${window.location.origin}/`, `${window.location.origin}/manifest.json`, ["publish_data", "store_write"] )
  })
  document.getElementById('signout-button').addEventListener('click', function(event) {
    event.preventDefault()
    blockstack.signUserOut(window.location.href)
  })
  function showProfile(profile) {
    var person = new blockstack.Person(profile)
    document.getElementById('heading-name').innerHTML = person.name() ? person.name() : "Nameless Person"
    if(person.avatarUrl()) {
      document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
    }
    document.getElementById('section-1').style.display = 'none'
    document.getElementById('section-2').style.display = 'block'
  }

  function getOTP(userData) {
    var txid = userData.identityAddress + "" + Math.random();
    console.log("txid", txid)
    return fetch("https://auth.openintents.org/c/" + txid, {method:"POST"})
      .then(response => {return response.json();}, error => console.log("error", error))
      .then(c => {
        const challenge = c.challenge;
        console.log("challenge", challenge)
        return blockstack.putFile("mxid.json", challenge, {encrypt:false}).then(() => {
          return {
            username: userData.identityAddress.toLowerCase(), 
            password:txid + "|" + window.location.origin + "|" + userData.username  
        }
      }, error => console.log("err2", error))
    })
  }

  if (blockstack.isUserSignedIn()) {
    var userData = blockstack.loadUserData()
    var profile = userData.profile
    showProfile(profile)
    document.getElementById('generate-button').addEventListener('click', function(event) {
      event.preventDefault()
      getOTP(userData).then(result => {
        document.getElementById('id-address').innerHTML = result.username  
        document.getElementById('password').innerHTML = result.password    
      })
      document.getElementById('section-login').style.display = 'block'
    })

    document.getElementById('send-button').addEventListener('click', function(event){
      event.preventDefault()
      console.log("creating client")
      var client = matrixcs.createClient("https://openintents.modular.im");
      getOTP(userData).then(result => {
        client.login("m.login.password", 
        {identifier: {
            "type": "m.id.user",
            "user": result.username
          },
        user: result.username,
        password: result.password,
        initial_device_display_name : "From OI Chat Account Manager"
      }, function(err, data){
          console.log("err", err)
          console.log("data", data)
      });
  
      })
    })
  } else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn().then(function(userData) {
      window.location = window.location.origin
    })
  }
})
