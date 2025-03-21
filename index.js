const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Configura CORS
const nodemailer = require('nodemailer');

// Inicializa Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// GetAllProjects Function
exports.getAllProjects = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const projectsSnapshot = await db.collection("projects").get();
      const projects = projectsSnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Formatea la marca de tiempo "created_at"
        let formattedCreatedAt = "";
        if (data.created_at && data.created_at.toDate) {
          const date = data.created_at.toDate();
          formattedCreatedAt = date.toLocaleString("es-MX", {
            timeZone: "America/Mexico_City", // Cambiar a la zona horaria de CDMX
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
        }

        // Formatea la fecha de finalización "finish_date"
        let formattedFinishDate = "";
        if (data.finish_date && data.finish_date.toDate) {
          const finishDate = data.finish_date.toDate();
          formattedFinishDate = finishDate.toLocaleString("es-MX", {
            timeZone: "America/Mexico_City",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
        }

        return {
          id: doc.id,
          name: data.name,
          discipline: data.discipline,
          finish_date: formattedFinishDate,
          on_time: data.on_time,
          revisions: data.revisions || 0,
          created_at: formattedCreatedAt,
        };
      });

      res.status(200).json(projects);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
      res.status(500).json({ error: "No se pudieron obtener los proyectos." });
    }
  });
});


// AddProject Function
exports.addProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { name, discipline, finish_date, on_time, revisions } = req.body;

      // Validación de campos obligatorios
      if (!name || !discipline || !finish_date || on_time === undefined || revisions === undefined) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios: name, discipline, finish_date, on_time, revisions.",
        });
      }

      // Conversión de la fecha de entrada a CDMX
      const parsedDate = new Date(finish_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          error: "El formato de fecha no es válido. Asegúrate de usar un formato de fecha compatible.",
        });
      }

      // Ajustar la fecha a la zona horaria de CDMX
      const finishDateInCDMX = new Date(
        parsedDate.toLocaleString("en-US", { timeZone: "America/Mexico_City" })
      );

      // Agregar el documento a Firestore
      const docRef = await db.collection("projects").add({
        name,
        discipline,
        finish_date: admin.firestore.Timestamp.fromDate(finishDateInCDMX),
        on_time,
        revisions,
        created_at: admin.firestore.Timestamp.now(), // Marca de tiempo de creación
      });

      res.status(201).json({ message: "Proyecto agregado exitosamente.", id: docRef.id });
    } catch (error) {
      console.error("Error al agregar el proyecto:", error);
      res.status(500).json({ error: "No se pudo agregar el proyecto." });
    }
  });
});


// DeleteProject Function
exports.deleteProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => { // Envuelve tu lógica dentro de cors
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "El campo id es obligatorio." });
      }
      const projectRef = db.collection("projects").doc(id);
      const projectDoc = await projectRef.get();
      if (!projectDoc.exists) {
        return res.status(404).json({ error: `No se encontró un proyecto con id: ${id}` });
      }
      await projectRef.delete();
      res.status(200).json({ message: `Proyecto con id ${id} eliminado exitosamente.` });
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      res.status(500).json({ error: "No se pudo eliminar el proyecto." });
    }
  });
});


// UpdateProject Function
// UpdateProject Function
exports.updateProject = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { id, name, discipline, finish_date, on_time, revisions } = req.body;

      console.log("Request body:", req.body);

      // Validar que el ID sea obligatorio
      if (!id) {
        return res.status(400).json({ error: "El campo id es obligatorio." });
      }

      // Preparar objeto de actualizaciones
      const updates = {};

      // Actualizar nombre si es proporcionado
      if (name) {
        updates.name = name;
      }

      // Actualizar disciplina si es proporcionada
      if (discipline) {
        updates.discipline = discipline;
      }

      // Actualizar fecha de finalización si es proporcionada
      if (finish_date) {
        const parsedDate = new Date(finish_date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: "El formato de fecha no es válido." });
        }
        updates.finish_date = admin.firestore.Timestamp.fromDate(parsedDate);
      }

      // Actualizar estado on_time si es proporcionado
      if (on_time) {
        if (on_time !== "Yes" && on_time !== "No") {
          return res.status(400).json({ error: "El valor de on_time debe ser 'Yes' o 'No'." });
        }
        updates.on_time = on_time;
      }

      // Actualizar revisiones si es proporcionado
      if (revisions) {
        if (isNaN(parseInt(revisions))) {
          return res.status(400).json({ error: "El valor de revisions debe ser un número entero." });
        }
        updates.revisions = revisions;
      }

      // Validar si hay al menos un campo para actualizar
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No hay campos para actualizar." });
      }

      // Referencia al proyecto en Firestore
      const projectRef = db.collection("projects").doc(id);

      // Actualizar en Firestore
      await projectRef.update(updates);

      console.log(`Project ${id} updated successfully with:`, updates);

      // Respuesta de éxito
      res.status(200).json({ message: `Proyecto con id ${id} actualizado exitosamente.` });
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
      res.status(500).json({ error: "No se pudo actualizar el proyecto." });
    }
  });
});


// AddCustomerResponse Function
exports.addCustomerResponse = functions.https.onRequest((req, res) => {
  cors(req, res, async () => { 
    try {
      const {
        name, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, time_duration, discipline
      } = req.body;

      // Validación de campos obligatorios
      if (!name || !q1 || !q2 || !q3 || !q4 || !q5 || !q6 || !q7 || !q8 || !q11 || !time_duration || !discipline) {
        return res.status(400).json({
          error: "Los campos q1, q2, q3, q4, q5, q6, q7, q8, q11 y time_duration son obligatorios.",
        });
      }

      // Guardar en Firestore con un ID automático
      const docRef = await db.collection("customer_responses").add({
        name,
        q1,
        q2,
        q3,
        q4,
        q5,
        q6,
        q7,
        q8,
        q9: q9 || "", // Si q9 está vacío, se guarda como una cadena vacía
        q10: q10 || "", // Si q10 está vacío, se guarda como una cadena vacía
        q11,
        discipline,
        time_duration,
        created_at: admin.firestore.Timestamp.now(), // Marca de tiempo de creación
      });

      // Respuesta exitosa
      res.status(201).json({
        message: "Respuesta del cliente agregada exitosamente.",
        id: docRef.id, // Devolver el ID generado automáticamente
      });
    } catch (error) {
      console.error("Error al agregar la respuesta del cliente:", error);
      res.status(500).json({ error: "No se pudo agregar la respuesta del cliente." });
    }
  });
});


exports.getAllCustomerResponses = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => { 
  try {
    // Obtiene todos los documentos de la colección "customer_responses"
    const responsesSnapshot = await db.collection("customer_responses").get();

    // Mapea los documentos a un arreglo formateado
    const responses = responsesSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Formatea la marca de tiempo "created_at"
      let formattedCreatedAt = "";
      if (data.created_at && data.created_at.toDate) {
        const date = data.created_at.toDate();
        formattedCreatedAt = date.toLocaleString("es-MX", {
          timeZone: "UTC",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      }

      return {
        id: doc.id, // Incluye el ID del documento Firestore
        name: data.name || "", // Si 'name' no está definido, devuélvelo vacío
        discipline: data.discipline || "", // Si 'discipline' no está definido, devuélvelo vacío  
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        q5: data.q5,
        q6: data.q6,
        q7: data.q7,
        q8: data.q8,
        q9: data.q9 || "", // Si q9 está vacío, devolver como cadena vacía
        q10: data.q10 || "", // Si q10 está vacío, devolver como cadena vacía
        q11: data.q11,
        time_duration: data.time_duration || "", // Si time_duration está vacío, devolver como cadena vacía
        created_at: formattedCreatedAt, // Agrega la fecha formateada
      };
    });

    // Envía la respuesta
    res.status(200).json(responses);
  } catch (error) {
    console.error("Error al obtener las respuestas de los clientes:", error);
    res.status(500).json({ error: "No se pudieron obtener las respuestas de los clientes." });
  }
  });
});

// GetDisciplines Function
exports.getDisciplines = functions.https.onRequest((req, res) => {
  cors(req, res, async () => { // Envuelve tu lógica dentro de cors
    try {
      const disciplinesSnapshot = await db.collection("disciplines").get();
      const disciplines = disciplinesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          discipline: data.discipline,
        };
      });
      res.status(200).json(disciplines);
    } catch (error) {
      console.error("Error al obtener los disciplinas:", error);
      res.status(500).json({ error: "No se pudieron obtener las disciplinas." });
    }
  });
});



// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar 'gmail' por otro proveedor como Outlook, etc.
  auth: {
      user: 'carlos.herrera.generac@gmail.com', // Tu dirección de correo
      pass: 'rpxm fzcq pwkx sngx', // Contraseña de aplicación o token
  },
});

// Función de Firebase para enviar correos
exports.sendEmail = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Usa POST.');
    }

    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).send('Faltan parámetros en el cuerpo de la solicitud.');
    }

    const mailOptions = {
        from: 'carlos.herrera.generac@gmail.com',
        to,
        subject,
        html,
    };

    try {
        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado correctamente:', info.response);

        // Actualizar el conteo en Firestore
        const surveyDocRef = db.collection('sent_surveys').where('survey', '==', 'Customers');

        const snapshot = await surveyDocRef.get();

        if (snapshot.empty) {
            console.error('No se encontró ningún documento con survey: "Customers".');
            return res.status(404).send('Documento no encontrado.');
        }

        snapshot.forEach(async (doc) => {
            const docRef = db.collection('sent_surveys').doc(doc.id);
            const currentData = doc.data();
            const currentNumber = parseInt(currentData.number || '0'); // Convertir el valor a entero, si no existe usar 0.

            await docRef.update({
                number: (currentNumber + 1).toString(), // Incrementar y guardar como string.
            });

            console.log(`Número actualizado en el documento ${doc.id}: ${currentNumber + 1}`);
        });

        return res.status(200).send('Correo enviado y conteo actualizado.');
    } catch (error) {
        console.error('Error al enviar correo o actualizar Firestore:', error);
        return res.status(500).send(error.toString());
    }
  });
});


// AddDiscipline Function
exports.addDiscipline = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { discipline } = req.body;

      // Validación de campos obligatorios
      if (!discipline) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios: discipline",
        });
      }

      // Agregar el documento a Firestore
      const docRef = await db.collection("disciplines").add({
        discipline,
      });

      res.status(201).json({ message: "Disciplina agregada exitosamente.", id: docRef.id });
    } catch (error) {
      console.error("Error al agregar disciplina:", error);
      res.status(500).json({ error: "No se pudo agregar la disciplina." });
    }
  });
});


// DeleteDiscipline Function
exports.deleteDiscipline = functions.https.onRequest((req, res) => {
  cors(req, res, async () => { // Envuelve tu lógica dentro de cors
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "El campo id es obligatorio." });
      }
      const projectRef = db.collection("disciplines").doc(id);
      const projectDoc = await projectRef.get();
      if (!projectDoc.exists) {
        return res.status(404).json({ error: `No se encontró un proyecto con id: ${id}` });
      }
      await projectRef.delete();
      res.status(200).json({ message: `Proyecto con id ${id} eliminado exitosamente.` });
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      res.status(500).json({ error: "No se pudo eliminar el proyecto." });
    }
  });
});


// DeleteCustomerResponse Function
exports.deleteCustomerResponse = functions.https.onRequest((req, res) => {
  cors(req, res, async () => { // Envuelve tu lógica dentro de cors
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "El campo id es obligatorio." });
      }
      const projectRef = db.collection("customer_responses").doc(id);
      const projectDoc = await projectRef.get();
      if (!projectDoc.exists) {
        return res.status(404).json({ error: `No se encontró una respuesta con id: ${id}` });
      }
      await projectRef.delete();
      res.status(200).json({ message: `Respuesta con id ${id} eliminado exitosamente.` });
    } catch (error) {
      console.error("Error al eliminar la respuesta:", error);
      res.status(500).json({ error: "No se pudo eliminar la respuesta." });
    }
  });
});

//addResourceUtilization Function
exports.addResourceUtilization = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { billable_hours, total_hours } = req.body;

      // Validación de campos obligatorios y numéricos
      if (
        billable_hours === undefined || total_hours === undefined ||
        !Number.isFinite(parseFloat(billable_hours)) ||
        !Number.isFinite(parseFloat(total_hours))
      ) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios y deben ser números.",
        });
      }

      // Agregar el documento a Firestore
      const docRef = await db.collection("resource_utilization").add({
        billable_hours: parseFloat(billable_hours),
        total_hours: parseFloat(total_hours),
        created_at: admin.firestore.Timestamp.now(),
      });

      res.status(201).json({ message: "Data added successfully.", id: docRef.id });
    } catch (error) {
      console.error("Error adding data", error);
      res.status(500).json({ error: "Couldn't add data." });
    }
  });
});

//addClientRetention Function
exports.addClientRetention = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { rep_clients, total_clients } = req.body;

      // Validación de campos obligatorios y numéricos
      if (
        rep_clients === undefined || total_clients === undefined ||
        !Number.isFinite(parseFloat(rep_clients)) ||
        !Number.isFinite(parseFloat(total_clients))
      ) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios y deben ser números.",
        });
      }

      // Agregar el documento a Firestore
      const docRef = await db.collection("client_retention").add({
        rep_clients: parseFloat(rep_clients),
        total_clients: parseFloat(total_clients),
        created_at: admin.firestore.Timestamp.now(),
      });

      res.status(201).json({ message: "Data added successfully.", id: docRef.id });
    } catch (error) {
      console.error("Error adding data", error);
      res.status(500).json({ error: "Couldn't add data." });
    }
  });
});

//addValueAdd Function
exports.addValueAdd = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { proposals, projects_completed } = req.body;

      // Validación de campos obligatorios y numéricos
      if (
        proposals === undefined || projects_completed === undefined ||
        !Number.isFinite(parseFloat(proposals)) ||
        !Number.isFinite(parseFloat(projects_completed))
      ) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios y deben ser números.",
        });
      }

      // Agregar el documento a Firestore
      const docRef = await db.collection("value_add").add({
        proposals: parseFloat(proposals),
        projects_completed: parseFloat(projects_completed),
        created_at: admin.firestore.Timestamp.now(),
      });

      res.status(201).json({ message: "Data added successfully.", id: docRef.id });
    } catch (error) {
      console.error("Error adding data", error);
      res.status(500).json({ error: "Couldn't add data." });
    }
  });
});

//addBudgetAdherence Function
exports.addBudgetAdherence = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { money_spent, amount_budgeted, amount_invoiced, amount_forecasted } = req.body;

      // Validación de campos obligatorios y numéricos
      if (
        money_spent === undefined || amount_budgeted === undefined ||
        amount_invoiced === undefined || amount_forecasted === undefined ||
        !Number.isFinite(parseFloat(money_spent)) ||
        !Number.isFinite(parseFloat(amount_budgeted)) ||
        !Number.isFinite(parseFloat(amount_invoiced)) ||
        !Number.isFinite(parseFloat(amount_forecasted))
      ) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios y deben ser números.",
        });
      }

      // Agregar el documento a Firestore
      const docRef = await db.collection("budget_adherence").add({
        money_spent: parseFloat(money_spent),
        amount_budgeted: parseFloat(amount_budgeted),
        amount_invoiced: parseFloat(amount_invoiced),
        amount_forecasted: parseFloat(amount_forecasted),
        created_at: admin.firestore.Timestamp.now(),
      });

      res.status(201).json({ message: "Data added successfully.", id: docRef.id });
    } catch (error) {
      console.error("Error adding data", error);
      res.status(500).json({ error: "Couldn't add data." });
    }
  });
});


// GET Resource Utilization
exports.getResourceUtilization = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collection("resource_utilization").get();
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          billable_hours: docData.billable_hours,
          total_hours: docData.total_hours,
          created_at: formatDate(docData.created_at)
        };
      });

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data", error);
      res.status(500).json({ error: "Couldn't fetch data." });
    }
  });
});

// GET Client Retention
exports.getClientRetention = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collection("client_retention").get();
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          rep_clients: docData.rep_clients,
          total_clients: docData.total_clients,
          created_at: formatDate(docData.created_at)
        };
      });

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data", error);
      res.status(500).json({ error: "Couldn't fetch data." });
    }
  });
});

// GET Value Add
exports.getValueAdd = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collection("value_add").get();
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          proposals: docData.proposals,
          projects_completed: docData.projects_completed,
          created_at: formatDate(docData.created_at)
        };
      });

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data", error);
      res.status(500).json({ error: "Couldn't fetch data." });
    }
  });
});

// GET Budget Adherence
exports.getBudgetAdherence = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collection("budget_adherence").get();
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          money_spent: docData.money_spent,
          amount_budgeted: docData.amount_budgeted,
          amount_invoiced: docData.amount_invoiced,
          amount_forecasted: docData.amount_forecasted,
          created_at: formatDate(docData.created_at)
        };
      });

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data", error);
      res.status(500).json({ error: "Couldn't fetch data." });
    }
  });
});

// Función para formatear timestamps de Firestore a "DD/MM/YYYY, hh:mm:ss a.m./p.m."
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return null;
  return timestamp.toDate().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
};
