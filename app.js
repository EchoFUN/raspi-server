/**
 * 
 * 
 * 
 * 
 * 
 *
 * @author XU Kai(xukai.ken@gmail.com)
 * @date 2016-12-04 星期日
 * 
 * 
 */

'use strict';

let socketCar, socketController;

const DIRECTIVE_MAP = {

  // Car direction controller.
  'lti': 'car_forward',
  'lli': 'car_left',
  'lri': 'car_right',
  'lbi': 'car_back',

  // Camera direction controller.
  'rti': 'camera_up',
  'rli': 'camera_left',
  'rri': 'camera_right',
  'rbi': 'camera_down'
};

let listen = (socket) => {

  // Tell the controller if CAR is online or not.
  socket.emit('car status', !!socketCar)

  // Recive the DRIECTIVES from the controller side.
  socket.on('directives', (direction) => {
    if (!socketCar) {
      return;
    }

    let act;
    if (direction.charAt(2) === 'o') {
      if (direction.charAt(0) === 'l') {
        act = 'car_pause';
      } else {
        act = 'camera_pause'
      }
    } else {
      act = DIRECTIVE_MAP[direction]
    }
    
    console.log(act + ' sent to the CAR .');
    socketCar.emit('directives', {
      'D': act,
      'S': ''
    })
  });
};


// DEMO Test.
/*
let timer;
let carRunDemo = () => {
  socketCar.emit('directives', {
    'D': 'car_forward'
  });

  timer = setTimeout(() => {
    socketCar.emit('directives', {
      'D': 'car_left',
      'S': '0.5'
    });

    timer = setTimeout(() => {
      socketCar.emit('directives', {
        'D': 'car_back',
        'S': 1000
      });

      timer = setTimeout(() => {
        socketCar.emit('directives', {
          'D': 'car_pause'
        });
      }, 1000);
    }, 1000);
  }, 1000);
}
*/


let hanler = (socket) => {
  let {
    specify
  } = socket.handshake.query;

  console.log(specify + ' is online.');
  switch (specify) {
    case 'CAR':
      socketCar = socket
      socketController && socketController.emit('car status', true);

      // setTimeout(carRunDemo, 5000);
      break;

    case 'SIGNAL':
      listen(socketController = socket);
      break;

    default:
      break;
  }
  socket.on('disconnect', () => {
    if (specify === 'CAR') {
      socketCar = null
      socketController && socketController.emit('car status', false);
    }
    (specify === 'SIGNAL') && (socketController = null);

    // clearTimeout(timer);
    console.log(specify + ' is offline.');
  });
};

const io = require('socket.io')();
io.on('connection', hanler);
io.listen(8080);