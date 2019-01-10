document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('signin-button').addEventListener('click', function(event) {
    event.preventDefault()
    blockstack.redirectToSignIn()
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

  if (blockstack.isUserSignedIn()) {
    var userData = blockstack.loadUserData()
    var profile = userData.profile
    showProfile(profile)
    document.getElementById('generate-button').addEventListener('click', function(event) {
      event.preventDefault()
      var txid = userData.identityAddress + "" + Math.random();
      console.log("txid", txid)
      fetch("https://auth.openintents.org/c/" + txid, {method:"POST"})
      .then(response => {return response.json();}, error => console.log("error", error))
      .then(c => {
          const challenge = c.challenge;
          console.log("challenge", challenge)
          console.log("profile", profile)
        blockstack.putFile("mxid.json", challenge, {encrypt:false}).then(() => {
          document.getElementById('id-address').innerHTML = userData.identityAddress  
          document.getElementById('password').innerHTML = txid + "|" + window.location.origin + "|" + userData.username  
        })
      }, error => console.log("err2", error));
      document.getElementById('section-login').style.display = 'block'
      
    })
  } else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn().then(function(userData) {
      window.location = window.location.origin
    })
  }
})
