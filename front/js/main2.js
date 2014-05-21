var app = angular.module('noggerClientApp', ['pasvaz.bindonce']);

app.controller("MainCtrl", ["$scope", function ($scope) {
  "use strict";
  $scope.autoScroll = true;
  $scope.currentFileName = "Stream";
  $scope.files = [
    {name: $scope.currentFileName, logs: []}
  ];
  $scope.selectedFile = 0;
  $scope.types = [];
  $scope.version = "";


  $scope.dialogue = {
    pw: {
      show: false,
      text: "Enter password",
      value: "",
      disabled: false
    },
    deleteFile: true
  };
  $scope.showPwDialogue = true;
  $scope.showDeleteDialogue = false;


  $scope.toggleAutoScroll = function () {
    $scope.autoScroll = !$scope.autoScroll;
  };

  $scope.loadFile = function (index, refresh) {
    $scope.selectedFile = index;
    $scope.types = [];
    if ($scope.files[index].logs === null || refresh) {
      $scope.files[index].logs = null;
      loadFile(index);
    } else {
      $scope.setTypes();
    }
  };

  $scope.auth = function () {
    var val = sessionStorage.pw || $scope.dialogue.pw.value;
    $scope.dialogue.pw.value = "";
    socket.emit('auth', val, function (data) {
      if (data.success === false) {
        sessionStorage.removeItem("pw");
        $scope.dialogue.pw.disabled = true;
        setCountdown(data.wait);
      } else {
        applyStyles(data.styles);
        $scope.version = "v" + data.version;
        sessionStorage.pw = val;
        getLogFileNames();
      }
    });
  };

  $scope.deleteFile = function () {
    var index = $scope.selectedFile;
    $scope.setTypes();
    $scope.selectedFile = 0;
    socket.emit('deleteLogFile', $scope.files[index].name, function (success) {

    });
  };

  $scope.setTypes = function () {
    $scope.types = [];
    angular.forEach($scope.files[$scope.selectedFile].logs, function (log) {
      if (!hasType(log.type)) {
        $scope.types.push({name: log.type, selected: true});
      }
    });
  };


  var socket = io.connect();
  // Listen for the new visitor event.
  socket.on('newLog', function (data) {
    $scope.$apply(function () {
      $scope.files[0].logs.push(data);
      if ($scope.selectedFile === 0 && !hasType(data.type)) {
        $scope.types.push({name: data.type, selected: true});
      }
    });

    if ($scope.autoScroll && $scope.selectedFile === 0) {
      setTimeout(function () {
        window.scrollTo(0, document.body.scrollHeight)
      })
    }
  });

  socket.on('logFileUpdate', function (data) {
    var index = getFileIndex(data.name);
    if (index === -1) {
      $scope.files.splice(1, 0, {name: data.name, logs: []});
      if ($scope.selectedFile !== 0) {
        $scope.selectedFile = $scope.selectedFile + 1;
      }
      index = 1;
    }

    if ($scope.files[index].logs !== null) {
      $scope.$apply(function () {
        $scope.files[index].logs.push(data.log);
      })
    }
  });


  socket.on('logFileDelete', function (data) {
    var index = getFileIndex(data);
    if (index !== -1) {
      $scope.$apply(function () {
        $scope.files.splice(index, 1);
      })
    }
  });


  if (sessionStorage["pw"] !== undefined) {
    $scope.auth();
  } else {
    $scope.dialogue.pw.show = true;
  }


  function setCountdown(time) {
    if (time > 0) {
      $scope.$apply(function () {
        $scope.dialogue.pw.show = true;
        $scope.dialogue.pw.text = "Wrong password. Enter again in " + time + "s.";
      });
      setTimeout(function () {
        setCountdown(--time);
      }, 1000)
    } else {
      $scope.$apply(function () {
        $scope.dialogue.pw.disabled = false;
        $scope.dialogue.pw.show = true;
        $scope.dialogue.pw.text = "Wrong password. Enter again.";
      });
    }
  }

  function getLogFileNames() {
    socket.emit('getLogFileNames', {}, function (data) {
      data = data.sort().reverse();
      $scope.$apply(function () {
        for (var i in data) {
          if (getFileIndex(data[i]) === -1) {
            $scope.files.push({name: data[i], logs: null})
          }
        }
      });
    });
  }

  function loadFile(index) {
    socket.emit('getLogFile', $scope.files[index].name, function (data) {
      $scope.$apply(function () {
        $scope.files[index].logs = data;
        $scope.setTypes();
      })
    });
  }

  function getFileIndex(name) {
    var index = -1;
    for (var i in $scope.files) {
      if ($scope.files[i].name === name) {
        index = i;
        break;
      }
    }
    return index;
  }

  function hasType(type) {
    for (var i in $scope.types) {
      if ($scope.types[i].name === type) {
        return true;
      }
    }
    return false;
  }

  function applyStyles(data) {
    var sheet = document.createElement('style');
    var inner = "";
    for (var i in data) {
      inner += "." +i + " {";
      for (var j in data[i]) {
        inner +=  j + ": " + data[i][j] + ";";
      }
      inner +=  " } ";
    }
    sheet.innerHTML = inner;
    document.body.appendChild(sheet);
  }
}
]);

app.filter("logs", function () {
  "use strict";
  return function (items, search, types) {


    var showTypes = [];
    for (var i in types) {
      if (types[i].selected) {
        showTypes.push(types[i].name);
      }
    }
    if (!search && types.length === showTypes.length) {
      return items;
    }

    var newItems = [];

    angular.forEach(items, function (item) {
      if ((!search || item.message.toString().indexOf(search) !== -1) && showTypes.indexOf(item.type) !== -1) {
        newItems.push(item);
      }
    });


    return newItems;
  }
});
