/*
    Se reescribió Material Dialog de https://github.com/rudmanmrrod/material-dialog
    con exactamente la misma funcionalidad, en ES6.
    Es importante que se comparen las dos versiones.
*/

'use strict';

export class MaterialDialog {

    /*
     * Method to create a modal alert like
     * @param text Receive modal text body
     * @param options Receive objects with options
     */
    static alert(text = '', options = {}) {
        let callBack = null;
        let otherOptions = options;

        let buttonText = 'Close';
        let buttonClass = '';
        let modalClose = 'modal-close';
        let htmlAlert = `<div class="modal material-alert"> 
                            <div class="modal-content">
                                <h5 class="modal-title"></h5>
                            </div> 
                            <div class="modal-footer"><div> 
                         </div>`;

        if (typeof(options.buttons) != 'undefined') {
            if (typeof(options.buttons.close) != 'undefined') {
                buttonText = typeof(options.buttons.close.text) != 'undefined' ? options.buttons.close.text : 'Close';
                buttonClass = typeof(options.buttons.close.className) != 'undefined' ? options.buttons.close.className : '';

                if (typeof(options.buttons.close.modalClose) != 'undefined') {
                    modalClose = options.buttons.close.modalClose == false ? '' : modalClose;
                }
                if (typeof options.buttons.close.callback !== 'undefined') {
                    if (typeof options.buttons.close.callback === 'function') {
                        callBack = options.buttons.close.callback;
                    } else {
                        console.warn('Lo asignado a la propiedad callBack no es una función');
                    }
                }
            }
        }

        options = {
            title: typeof(options.title) != 'undefined' ? options.title : 'Alert',
            footer: typeof(options.footer) != 'undefined' ? options.footer : '',
            button: `<button class="btn ${modalClose} ${buttonClass} close">${buttonText}</button>`
        };

        let body = document.getElementsByTagName('body')[0];
        body.insertAdjacentHTML('beforeend', htmlAlert);
        let last_material = document.getElementsByClassName('material-alert')[document.getElementsByClassName('material-alert').length - 1]
        last_material.getElementsByClassName('modal-title')[0].textContent = options.title;
        last_material.getElementsByClassName('modal-content')[0].insertAdjacentHTML('beforeend', text);
        last_material.getElementsByClassName('modal-footer')[0].insertAdjacentHTML('beforeend', options.footer);
        last_material.getElementsByClassName('modal-footer')[0].insertAdjacentHTML('beforeend', options.button);
        let instance = M.Modal.init(last_material, otherOptions)
        instance.open();

        if (typeof callBack === 'function') {
            let close = last_material.getElementsByClassName('close')[0]
            close.addEventListener('click', function() {
                callBack.call();
            });
        }

    };

    /*
     * Method to create a modal dialog like
     * @param text Receive modal text body
     * @param options Receive objects with options
     */
    static dialog(text = '', options = {}) {
        let callback_close = null;
        let callback_confirm = null;
        let other_options = options;

        let titleHere = typeof(options.title) != 'undefined' ? options.title : 'Dialog';
        let classHere = typeof(options.modalType) != 'undefined' ? options.modalType : '';

        let closeButtonText = 'Close';
        let closeButtonClass = 'red';
        let modalClose = 'modal-close close';

        let confirmButtonText = 'Confirm';
        let confirmButtonClass = 'blue';
        let modalCloseConfirm = 'modal-close confirm';

        if (typeof(options.buttons) != 'undefined') {
            console.log('entra 1');

            if (typeof(options.buttons.close) != 'undefined') {
                closeButtonText = typeof(options.buttons.close.text) != 'undefined' ? options.buttons.close.text : 'Close';
                closeButtonClass = typeof(options.buttons.close.className) != 'undefined' ? options.buttons.close.className : '';

                if (typeof(options.buttons.close.modalClose) != 'undefined') {
                    modalClose = options.buttons.close.modalClose == false ? 'close' : 'modal-close close';
                }

                if (typeof(options.buttons.close.callback) != 'undefined') {
                    callback_close = options.buttons.close.callback;
                }
            }

            if (typeof(options.buttons.confirm) != 'undefined') {
                confirmButtonText = typeof(options.buttons.confirm.text) != 'undefined' ? options.buttons.confirm.text : 'Confirm';
                confirmButtonClass = typeof(options.buttons.confirm.className) != 'undefined' ? options.buttons.confirm.className : '';

                if (typeof(options.buttons.confirm.modalClose) != 'undefined') {
                    modalCloseConfirm = options.buttons.confirm.modalClose == false ? 'confirm' : 'modal-close confirm';
                }
                if (typeof(options.buttons.confirm.callback) != 'undefined') {
                    callback_confirm = options.buttons.confirm.callback;
                }
            }
        }

        let body = `<div class="modal material-dialog ${classHere}"> 
                        <div class="modal-content">
                            <h5 class="modal-title">${titleHere}</h5>
                        </div> 
                        <div class="modal-footer"> 
                            <button class="btn ${modalClose} ${closeButtonClass}">${closeButtonText}</button>&nbsp; 
                            <button class="btn ${modalCloseConfirm} ${confirmButtonClass}">${confirmButtonText}</button> 
                        </div> 
                    </div>`;

        let html_body = document.getElementsByTagName('body')[0];
        html_body.insertAdjacentHTML('beforeend', body);
        let last_material = document.getElementsByClassName('material-dialog')[document.getElementsByClassName('material-dialog').length - 1]
        last_material.getElementsByClassName('modal-content')[0].insertAdjacentHTML('beforeend', text);
        let instance = M.Modal.init(last_material, other_options)
        instance.open()

        if (callback_close) {
            let close = last_material.getElementsByClassName('close')[0];
            close.addEventListener('click', function() {
                callback_close.call();
            });
        }

        if (callback_confirm) {
            let confirm = last_material.getElementsByClassName('confirm')[0];
            confirm.addEventListener('click', function() {
                callback_confirm.call();
            });
        }
    }
}