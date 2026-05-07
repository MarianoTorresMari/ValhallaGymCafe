# Prompt de QA — Valhalla Gym & Café

Usá este prompt para pedirle a una IA (Claude, ChatGPT, etc.) que te genere casos de prueba, o seguí el checklist manualmente en el navegador.

---

## Prompt para IA

```
Eres un QA engineer senior. Tenés que probar una aplicación web llamada "Valhalla Gym & Café" construida en React + Firebase Firestore.

La app tiene tres vistas:
1. **Home** — Landing page con logo, tarjeta de acceso al Café y botón oculto de admin.
2. **Café** — Interfaz de pedidos por mesa. El cliente ingresa número de mesa y nombre, ve el menú por categorías, agrega productos al carrito, elige método de pago (transferencia o efectivo) y confirma el pedido. Puede llamar al mozo o pedir la cuenta con un botón de campana (cooldown de 10 minutos).
3. **Admin** — Panel protegido por contraseña. Muestra pedidos en tiempo real, notificaciones, mesas activas y editor de menú.

Generá casos de prueba exhaustivos para cada uno de los siguientes escenarios, indicando: **Descripción**, **Pasos**, **Resultado esperado**, **Resultado posible de error**.
```

---

## Checklist manual de pruebas

### HOME
- [ ] La página carga correctamente con logo, título y tarjeta.
- [ ] Hacer clic en la tarjeta "Café Bar" navega a la vista del café.
- [ ] El botón de candado (admin) en la esquina superior derecha lleva al panel de admin.
- [ ] El fondo y el logo se renderizan sin errores visuales en mobile y desktop.

---

### CAFÉ — Flujo de mesa

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 1 | Mesa nueva | Ingresar número de mesa inexistente + nombre → Continuar | Se crea la mesa, se cierra el modal, aparece el menú |
| 2 | Mesa existente | Ingresar número de mesa ya activa → Continuar | Aparece modal con personas en mesa y opción de unirse |
| 3 | Unirse a mesa | Unirse a una mesa activa con nombre propio | Sesión creada como invitado, carrito independiente |
| 4 | Campo vacío | Intentar continuar sin número de mesa | Botón deshabilitado / sin acción |
| 5 | Mesa sin nombre | Solo número de mesa, dejar nombre vacío | Se asigna "Principal" como nombre de sesión |
| 6 | Volver al inicio | Hacer clic en "← Volver" desde el modal | Regresa a Home sin errores |

---

### CAFÉ — Menú y carrito

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 7 | Filtro de categorías | Hacer clic en cada categoría | Solo se muestran productos de esa categoría |
| 8 | Agregar producto | Clic en "Agregar" en un producto | Producto aparece en carrito, badge se actualiza, toast visible |
| 9 | Duplicar producto | Agregar el mismo producto dos veces | Cantidad incrementa en 1, no se duplica la fila |
| 10 | Restar cantidad | Bajar cantidad a 0 desde el carrito | El item se elimina del carrito |
| 11 | Eliminar item | Clic en X de un item del carrito | Item desaparece, total se recalcula |
| 12 | Carrito vacío | Abrir carrito sin productos | Muestra estado vacío, sin errores |
| 13 | Total calculado | Agregar 2 x $1500 + 1 x $2000 | Total = $5000 |
| 14 | Productos no disponibles | Producto marcado como no disponible en admin | No aparece en el menú del cliente |

---

### CAFÉ — Confirmación de pedido

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 15 | Confirmar sin método de pago | Clic en "Confirmar Pedido" en modal de pago sin seleccionar método | Botón deshabilitado |
| 16 | Pago por transferencia | Seleccionar Transferencia → Confirmar | Pedido creado en Firestore con paymentMethod: 'transfer' |
| 17 | Pago en efectivo | Seleccionar Efectivo → Confirmar | Pedido creado con paymentMethod: 'cash' |
| 18 | Carrito se vacía post-pedido | Confirmar pedido exitosamente | Carrito queda vacío, modal se cierra |
| 19 | Pedido aparece en Admin | Confirmar pedido desde cliente | Aparece en pestaña Pedidos del Admin en estado PENDIENTE |

---

### CAFÉ — Notificaciones

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 20 | Pedir cuenta | Clic en campana → "Pedir la Cuenta" | Notificación creada, feedback verde visible 5 segundos |
| 21 | Llamar mozo | Clic en campana → "Llamar Mozo/a" | Notificación creada, feedback visible |
| 22 | Cooldown 10 min | Enviar notificación → intentar enviar otra de inmediato | Mensaje de espera con minutos restantes |
| 23 | Indicador de cooldown | Durante cooldown activo | Punto rojo visible en el ícono de campana |

---

### CAFÉ — Mesa desactivada

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 24 | Admin reinicia mesa | Desde Admin, reiniciar mesa activa | Cliente ve modal "Mesa Desactivada" dentro de ~3 segundos |
| 25 | Retomar sesión post-desactivación | Hacer clic en "Entendido" | Vuelve al modal de ingreso de mesa |
| 26 | Liberar mesa (dueño) | Clic en ícono de salida (anfitrión) → confirmar | Mesa eliminada de Firestore, sesión reiniciada |
| 27 | Liberar mesa (invitado) | Invitado intenta hacer clic en salida | No debería aparecer el botón (solo anfitrión lo ve) |

---

### ADMIN — Autenticación

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 28 | Contraseña correcta | Ingresar contraseña válida | Acceso al panel |
| 29 | Contraseña incorrecta | Ingresar contraseña incorrecta | SweetAlert con "Acceso denegado" |
| 30 | Enter en campo password | Escribir contraseña + Enter | Dispara login igual que botón |
| 31 | Volver desde login | Clic en "Volver" | Regresa a Home |

---

### ADMIN — Pedidos

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 32 | Lista vacía | Sin pedidos en Firestore | Estado vacío con ícono y mensaje |
| 33 | Marcar completado | Clic en "Marcar como Completado" | Estado cambia a COMPLETADO, timestamp visible |
| 34 | Cancelar pedido | Clic en "Cancelar" → confirmar | Estado cambia a CANCELADO |
| 35 | Cancelar sin confirmar | Clic en "Cancelar" → "No" en SweetAlert | Pedido queda en PENDIENTE |
| 36 | Badge de pendientes | Hay 3 pedidos pendientes | Número 3 visible en tab Pedidos |

---

### ADMIN — Notificaciones

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 37 | Marcar atendido | Clic en "Marcar como Atendido" | Estado cambia a ATENDIDO con timestamp |
| 38 | Distinguir tipo | Notificación de cuenta vs mozo | Íconos y títulos distintos |

---

### ADMIN — Mesas

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 39 | Lista de sesiones | Mesa con 2 personas unidas | Muestra ambas con nombre y badge "Anfitrión" |
| 40 | Reiniciar mesa | Clic en "Reiniciar Mesa" → confirmar | Mesa marcada como desactivada, luego eliminada a los 3s |
| 41 | Mesa desactivada en lista | Después de reiniciar (antes del delete) | Badge DESACTIVADA visible, sin botón de reinicio |

---

### ADMIN — Menú

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|--------------------|
| 42 | Toggle disponibilidad | Apagar toggle de un producto | Producto desaparece del menú del cliente |
| 43 | Editar precio | Cambiar precio → Guardar | Precio actualizado en Firestore y en menú del cliente |
| 44 | Editar descripción | Cambiar descripción → Guardar | Descripción actualizada |
| 45 | Botón guardar condicional | Sin hacer cambios | Botón "Guardar" no aparece |
| 46 | Filtro de búsqueda | Buscar "café" | Solo se muestran items que contengan "café" |
| 47 | Filtro por categoría | Seleccionar "Hamburguesas" | Solo items de esa categoría |
| 48 | Menú vacío | Sin items en Firestore | Aparece botón "Cargar menú inicial" |
| 49 | Seed del menú | Clic en "Cargar menú inicial" → confirmar | Se cargan los ~92 items correctamente |

---

### RESPONSIVE / UX

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 50 | Mobile (360px) | Header, categorías y carrito flotante correctamente posicionados |
| 51 | Tablet (768px) | Grid de 2 columnas en menú, carrito lateral correcto |
| 52 | Desktop (1280px+) | Grid de 3 columnas, carrito lateral visible |
| 53 | Scroll horizontal categorías | En mobile, scroll sin mostrar barra |
| 54 | Carrito drawer mobile | Se desliza desde abajo, máx 60vh |
| 55 | Carrito sidebar desktop | Se desliza desde la derecha a pantalla completa |

---

### ERRORES DE RED / EDGE CASES

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 56 | Sin conexión a internet | Operaciones de Firestore muestran SweetAlert de error |
| 57 | Firebase quota exceeded | Error manejado con alerta visible |
| 58 | Sesión expirada (3hs) | `expiresAt` vencido — comportamiento a verificar manualmente |
| 59 | Dos pestañas misma mesa | Ambas deben reflejar cambios en tiempo real (suscripción Firestore) |
| 60 | Recarga de página mid-session | Se pierde la sesión (state en memoria) — comportamiento esperado |
