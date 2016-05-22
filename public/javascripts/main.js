'use_strict';

POSSIBLE_HANDS = [
    'fa-hand-lizard-o',
    'fa-hand-paper-o',
    'fa-hand-spock-o',
    'fa-hand-rock-o',
    'fa-hand-scissors-o'];

var socket = io();

socket.on('first_ready', function(data) {
    // The code
    console.log(data);

    $('#content_code').text('Give this code to your partner: ' + data['code']);

    // Color the left background
    $('#left').addClass('mdl-color--cyan-700');
    $('#right').css('background-color', '#eee');
});


socket.on('complete', function(data) {

    var snackbarContainer = document.querySelector('#user-connected-toast');
    var data = {message: 'User connected!'};
    snackbarContainer.MaterialSnackbar.showSnackbar(data);

    // Set the right screen color - signal new user connected
    $('#right').addClass('mdl-color--cyan-500');
    
    // Set the status mark
    $('#logged').removeClass('mdl-color-text--grey-100');
    $('#logged').removeClass('fa-question-circle');
    $('#logged').addClass('mdl-color-text--red-A200');
    $('#logged').addClass('fa-check-circle');


    for (var i in POSSIBLE_HANDS) {
        $('[id^=user-icon]').removeClass(POSSIBLE_HANDS[i]);
        $('[id^=user-icon]').addClass('mdl-color-text--grey-200');
    }

    var right_user_icon = POSSIBLE_HANDS[data['opponent']];
    var left_user_icon = POSSIBLE_HANDS[data['index']];

    $('#user-icon-right').addClass(right_user_icon);
    $('#user-icon-left').addClass(left_user_icon);

    // Remove all and show timer
    var dialog = document.querySelector('dialog');
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.close();

    // Timer
    $('#countdown-container').show();

    var count=10;
    var counter=setInterval(timer, 1000);

    function timer()
    {
        count=count-1;
        if (count <= 0)
        {
            clearInterval(counter);
            // Emoji
            $('#countdown').text('Play!');
            // $('#countdown').text("🎉");
            return;
        }
        //Do code for showing the number of seconds here
        $('#countdown').text(parseInt(count));
    }

});

$(document).ready(function(){

    var left_user_icon = POSSIBLE_HANDS[Math.floor(Math.random()*POSSIBLE_HANDS.length)];
    $('#user-icon-left').addClass(left_user_icon);
    $('#user-icon-left').removeClass('fa-check-circle');
    $('#div_input_code').hide();

    var dialog = document.querySelector('dialog');
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.showModal();

    dialog.querySelector('.ready').addEventListener('click', function(){
        // Socket io emit
        $('#div_input_code').show("fast");
        $('#content_code').hide("fast");
        $('.ready').hide();
    });

    $('#code_input').on('keyup', function() {
        var code = $('#code_input').val();
        socket.emit('match_code', {code: code});
    });


    // Reset
    var countContainer = document.getElementById('countdown-container');
    countContainer.addEventListener('click'), function () {
        window.href = '/';
    }

});
