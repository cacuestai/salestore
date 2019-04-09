export class Usuario {

    /**
     * Se envían los datos de autenticación del usuario al back-end. Si el usuario
     * se logra autenticar se referencian los datos del usuario a nivel de aplicación y
     * se ejecuta el callBack que recibe el argumento "hacerAlgo".
     * @param {Function} hacerAlgo Una función que debe ejecutarse cuando el usuario se autentique
     */
    validar(hacerAlgo) {
        let idPersona = $('#login-usuario').value;
        let contrasena = $('#login-password').value;

        util.fetchData(util.URL, {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': {
                clase: 'Personal',
                accion: 'autenticar',
                idPersona: idPersona,
                contrasena: contrasena
            }
        }).then(data => {
            if (data.ok) {
                util.setUsuario(data.usuario);
                if (typeof hacerAlgo === 'function') {
                    hacerAlgo();
                } else {
                    util.mensaje('Se esperaba una función');
                }
            } else {
                // por seguridad, eliminar los datos que se introdujeron
                $('#login-usuario').value = '';
                $('#login-password').value = '';
                $('#login-titulo').className = 'red-text';
                $('#login-titulo').innerHTML = 'Intente de nuevo ingresar a su cuenta';
                util.mensaje(data.mensaje, 'Usuario o contraseña erróneos');
            }
        }).catch(error => {
            util.mensaje(error, 'No se pudo realizar la autenticación del usuario');
        });
    }

    restaurarContrasena() {
        // asignar y enviar por correo una contraseña por defecto que debe cambiarse
        throw "Falta implementar";
    }

    cambiarContrasena() {
        // desplegar un formulario que permita ingresar una nueva contraseña
        throw "Falta implementar";
    }

}