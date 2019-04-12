/**
 * 
 */
'use strict';

export class ControlDeInactividad {

    constructor() {

        this.idleDurationSecs = 3; // X number of seconds
        this.redirectUrl = 'index.html'; // Redirect idle users to this URL
        this.idleTimeout; // variable to hold the timeout, do not modify

        // Init on page load
        this.resetIdleTimeout();

        // Reset the idle timeout on any of the events listed below
        ['click', 'touchstart', 'mousemove'].forEach(evt =>
            document.addEventListener(evt, this.resetIdleTimeout, false)
        );
    }

    fsfsfsfsdfsdf() {
        MaterialDialog.dialog('Esto se va a cerrar', {
            title: 'Filtrar datos',
            buttons: {
                close: {
                    text: 'Terminar',
                    callback: () => location.href = this.redirectUrl
                },
                confirm: {
                    text: 'Filtrar',
                    //callback: buscarDatos // uso de la función definida en la línea 27
                }
            }
        });
    }

    resetIdleTimeout() {
        let x = this.fsfsfsfsdfsdf;
        // Clears the existing timeout
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }

        // Set a new idle timeout to load the redirectUrl after idleDurationSecs
        this.idleTimeout = setTimeout(() => {
            // location.href = this.redirectUrl;
            x()
        }, this.idleDurationSecs * 1000);
    };



}