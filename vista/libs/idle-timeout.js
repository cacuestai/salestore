/**
 * 
 */
'use strict';

export class ControlDeInactividad {

    constructor() {

        this.idTimeOut;

        document.onmousedown = function() {
            inactivityTime();
        };

        document.onkeypress = function() {
            inactivityTime();
        };

        document.ontouchstart = function() {
            inactivityTime();
        };

        this.resetTimer();
    }

    inactivityTime() {
        document.addEventListener('mousemove', this.resetTimer);
        document.addEventListener('keypress', this.resetTimer);
    };

    resetTimer() {
        /*
            Debe quedar funcionando así:
            - reiniciar un conteo de 20 segundos
            - desplegar un diálogo donde se vea el conteo
            - si se pulsa el botón continuar
            -   clearTimeout & setTimeout(logout, segundosEstablecidos)
            - si no
            -   si se alcanza el tiempo de espera, terminar la sesión
            - Fin si 
        */
        clearTimeout(this.idTimeOut);
        this.idTimeOut = setTimeout(logout, 6000)

        function logout() {
            console.log('Se acabó su tiempo');
            //location.href = 'logout.php'
        }
    }

}