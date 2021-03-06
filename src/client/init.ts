module Client {
  /// <reference path="../../typings/index.d.ts"/>

  export var socket = io();
  var game: Game;

  socket.on('test', (id) => {
    console.log('test', id)
  });

  socket.on('lobby_created', (err) => {
    if(App.State === AppStates.LOBBY)
    console.log('Lobby created. Errors:' + err);
  });

  socket.on('leave_game', (err) => {
    if (App.State === AppStates.GAME) {
      // TODO implement some popup
      alert("Player has left the game...");
      App.State = AppStates.MENU;
    }
  });

  // init app class
  window.onload = () => {
    App.initApp(
      $('#mainMenu'),
      $('#gameList'),
      $('#lobby'),
      $('#game')
    );
    App.State = AppStates.MENU;
  };
}
