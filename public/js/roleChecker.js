// Importar los SDK necesarios de Firebase
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Inicializar Firestore y Auth
const db = getFirestore();
const auth = getAuth();

/**
 * Función para restringir el acceso a una página basado en roles.
 * @param {Array} allowedRoles - Lista de roles permitidos.
 * @param {String} redirectPage - Página a la cual redirigir si el usuario no tiene permiso.
 */
export async function restrictAccess(allowedRoles, redirectPage) {
    try {
        // Esperar hasta que el usuario esté autenticado
        const user = await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((authUser) => {
                unsubscribe(); // Detener el listener después de obtener el estado del usuario
                resolve(authUser);
            });
        });

        if (!user) {
            console.error("Usuario no autenticado");
            window.location.href = redirectPage;
            return;
        }

        console.log("UID del usuario:", user.uid);

        // Obtener el UID del usuario y buscar su rol en Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Datos del usuario obtenidos de Firestore:", userData);

            // Verificar si el rol del usuario está permitido
            if (allowedRoles.includes(userData.role)) {
                console.log("Acceso permitido. Rol del usuario:", userData.role);
                return; // Permitir acceso
            } else {
                console.warn("Acceso denegado. Rol insuficiente:", userData.role);
                window.location.href = redirectPage; // Redirigir si no tiene el rol adecuado
            }
        } else {
            console.error("El documento del usuario no existe en Firestore.");
            window.location.href = redirectPage;
        }
    } catch (error) {
        console.error("Error en restrictAccess:", error);
        window.location.href = redirectPage; // Redirigir en caso de error
    }
}
