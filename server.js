// ----------------------------
// 🟦 Servidor Node.js para Inlotrans
// Envia los datos del formulario por correo Outlook con PDF adjunto
// ----------------------------
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// 📎 Configurar multer (manejo de archivos PDF)
// ----------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------------------
// ✉️ Configurar transporte de correo (Outlook / Office 365)
// ----------------------------
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: "TU_CORREO@inlotrans.com.co", // 👈 tu correo Outlook corporativo
    pass: "TU_CONTRASEÑA",              // 👈 tu contraseña o contraseña de aplicación
  },
  tls: { ciphers: "SSLv3" },
});

// ----------------------------
// 🌐 Servir el formulario HTML y recursos
// ----------------------------
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ----------------------------
// 📬 Ruta para recibir y enviar el correo
// ----------------------------
app.post("/enviar-novedad", upload.single("archivo"), async (req, res) => {
  try {
    const { cedula, nombre, operacion, justificacion, descripcion } = req.body;
    const archivo = req.file;

    const mailOptions = {
      from: `"Registro de Novedades" <TU_CORREO@inlotrans.com.co>`,
      to: "natalia.castellanos@inlotrans.com.co",
      subject: `Nueva Novedad - ${nombre}`,
      html: `
        <h2>Registro de Novedad</h2>
        <p><strong>Cédula:</strong> ${cedula}</p>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Operación:</strong> ${operacion}</p>
        <p><strong>Justificación:</strong> ${justificacion}</p>
        <p><strong>Descripción:</strong> ${descripcion}</p>
        <hr>
        <p>📎 Se adjunta el archivo PDF con la novedad.</p>
      `,
      attachments: archivo
        ? [
            {
              filename: archivo.originalname,
              content: archivo.buffer,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);
    res.json({ ok: true, mensaje: "Correo enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ ok: false, error: "Error al enviar el correo" });
  }
});

// ----------------------------
// 🚀 Iniciar servidor
// ----------------------------
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`)
);
