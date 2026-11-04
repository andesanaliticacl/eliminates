# Elimínate

Landing con informe interactivo y sistema de solicitudes de evaluación gratuita: datos, documentos y agenda, con confirmación automática por WhatsApp y correo, más un panel de administración.

**Stack:** Next.js (App Router), TypeScript, Tailwind, GSAP + ScrollTrigger, Lenis, Supabase (Postgres, Storage, Auth), WhatsApp Business Cloud API, Resend (correo), Vercel.

## Probarlo sin credenciales

```bash
npm install
cp .env.example .env.local
npm run dev
```

Con `DEMO_MODE=true` todo funciona en local: los datos quedan en memoria (se borran al reiniciar), y los WhatsApp y correos se imprimen en la consola. El panel está en `/admin` y entra sin contraseña. Este modo se ignora en Vercel y cuando hay credenciales de Supabase.

```bash
npm test
```

## Paso 1: crear el proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com), en una región cercana (São Paulo).
2. En **SQL Editor**, pega y ejecuta completo [`supabase/schema.sql`](supabase/schema.sql). Crea las tablas, las funciones, las políticas RLS y el bucket privado `documentos`.
3. En **Project Settings → API**, copia a tus variables de entorno:
   - Project URL → `SUPABASE_URL`
   - anon / publishable key → `SUPABASE_ANON_KEY`
   - service_role / secret key → `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, nunca con prefijo `NEXT_PUBLIC_`)
4. Crea tu usuario administrador en **Authentication → Users → Add user**, con una contraseña larga. Desactiva los registros públicos en **Authentication → Sign In / Providers** (*Allow new users to sign up*).
5. Dale permisos de administrador, en SQL Editor:

   ```sql
   insert into admin_usuarios (user_id)
   select id from auth.users where email = 'tu-correo@dominio.cl';
   ```

## Paso 2: configurar WhatsApp Business

1. En [Meta for Developers](https://developers.facebook.com/apps), crea una app de tipo **Empresa** y agrega el producto **WhatsApp**.
2. Registra tu número de teléfono y copia el **Phone number ID** a `WHATSAPP_PHONE_NUMBER_ID`.
3. Crea un **usuario del sistema** en el Business Manager con permiso `whatsapp_business_messaging`, genera un token permanente y cópialo a `WHATSAPP_TOKEN`. El token temporal del panel dura 24 horas.
4. En **WhatsApp Manager → Plantillas**, envía a aprobación estas dos plantillas, categoría **Utilidad**, idioma **Español** (código `es`).

### Plantilla para el cliente: `solicitud_en_curso`

```text
Hola {{1}}, tu solicitud ya está en curso ✅. Tu número de atención es {{2}}. Tu cita quedó para el {{3}} a las {{4}}. Ya vas a ser atendido: un abogado revisará tu caso y te contactará. Responde este mensaje si tienes dudas.
```

Ejemplos para la revisión de Meta: `{{1}}` María, `{{2}}` ELM-000123, `{{3}}` martes 4 de noviembre, `{{4}}` 10:30.

### Plantilla para el abogado: `aviso_nueva_solicitud`

```text
Nueva solicitud {{1}}. Cliente: {{2}}. Cita: {{3}}. Revisa el detalle en el panel: {{4}} . Mensaje automático de Elimínate.
```

Ejemplos: `{{1}}` ELM-000123, `{{2}}` María Pérez, `{{3}}` martes 4 de noviembre a las 10:30, `{{4}}` https://tu-dominio.cl/admin/solicitudes/ejemplo.

Si les pones otros nombres, ajusta `WHATSAPP_TEMPLATE_CLIENTE`, `WHATSAPP_TEMPLATE_ABOGADO` y `WHATSAPP_TEMPLATE_LANG`.

## Paso 3: correo y anti-spam

- **Correo:** crea una cuenta en [Resend](https://resend.com), verifica tu dominio y completa `RESEND_API_KEY` y `EMAIL_FROM`.
- **Turnstile (recomendado):** crea un widget en Cloudflare y completa `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`. Sin estas claves la protección queda en honeypot y rate limiting.
- **Rate limit:** define `RATE_LIMIT_SALT` con una cadena larga al azar.

## Paso 4: deploy en Vercel

1. Sube el proyecto a un repositorio de GitHub e impórtalo en [Vercel](https://vercel.com/new).
2. En **Settings → Environment Variables**, carga todas las variables de `.env.example`, salvo `DEMO_MODE`. `NEXT_PUBLIC_SITE_URL` debe ser tu dominio final con `https://`.
3. Haz el deploy y conecta tu dominio.
4. Entra a `/admin/configuracion` y completa teléfono, WhatsApp, correo, dirección, logo, abogado responsable, contadores y testimonios.

Sin credenciales de Supabase la landing se muestra igual con los valores por defecto, y el formulario responde que el servicio no está configurado.

## Antes de publicar

- [ ] **Contadores y testimonios reales.** Los de fábrica no se publican: aparecen al guardarlos en el panel. Usa solo cifras comprobables y testimonios autorizados.
- [ ] **Revisión legal de las páginas.** `/privacidad` y `/terminos` son borradores con campos entre corchetes y un aviso visible en la página: quita el aviso de `src/components/landing/PaginaLegal.tsx` una vez aprobados.
- [ ] **Cobro de la gestión.** La evaluación es gratis. Falta definir con la cliente cuándo y cómo se cobra la gestión; ver "Pagos" más abajo.
- [ ] Prueba de punta a punta con un WhatsApp y un correo reales.

## Cómo está organizado

| Ruta | Qué contiene |
| --- | --- |
| `src/app/page.tsx` | Landing: texto de todas las escenas |
| `src/components/landing/Animaciones.tsx` | Todas las animaciones de scroll |
| `src/components/landing/TarjetaInforme.tsx` | La tarjeta "Informe comercial" |
| `src/components/wizard/` | Wizard de 3 pasos y página de confirmación |
| `src/app/api/` | Agenda, solicitudes, documentos y exportación |
| `src/lib/notificaciones.ts` | Avisos por WhatsApp y correo |
| `src/lib/store/` | Persistencia: Supabase y memoria (demo) |
| `src/app/admin/` | Panel de administración |
| `supabase/schema.sql` | Tablas, funciones y políticas RLS |

## Decisiones que conviene conocer

- **Sin doble reserva.** Lo garantiza un índice único parcial en Postgres, no el código. El horario se retiene al enviar y se confirma al terminar; si el envío queda a medias, se libera solo a los 30 minutos, sin necesidad de un cron.
- **Horario perdido.** Si al confirmar el horario ya lo tomó otra persona, la solicitud se registra igual, se marca el conflicto en el panel y se avisa por correo que se coordinará otra hora. En ese caso no se envía la plantilla de WhatsApp al cliente, porque afirma una fecha.
- **Notificaciones sin duplicados.** Cada canal se reclama en la tabla `notificaciones` antes de enviar y se suelta si falla; repetir el envío reintenta solo lo pendiente.
- **Documentos.** Suben directo a Storage con URL firmada, porque Vercel limita el cuerpo de las funciones a 4,5 MB. Después, el servidor lee el archivo y comprueba su firma binaria; si no coincide, lo borra.
- **Borrador local.** Los textos se guardan en `localStorage` hasta por 7 días. Los archivos no, por privacidad: tras recargar, se pide adjuntarlos de nuevo.

## Pagos

La evaluación es gratis y hoy el sitio no cobra nada. La gestión legal sí se cobrará, pero falta definir cuándo y cómo. La integración con Mercado Pago (preferencias, webhook firmado y reintentos) quedó en el historial de git, en el commit `fdbab75`, como base para retomarla.
