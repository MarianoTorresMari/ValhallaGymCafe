import { setMenuItem } from '../services/storageService'

const menuData = [
  // Infusiones Calientes
  { id:"ic_classic",      name:"Classic",          category:"Infusiones Calientes", price:4500,  description:"Infusión + 2 medialunas o tortillas", available:true },
  { id:"ic_light",        name:"Light",            category:"Infusiones Calientes", price:5500,  description:"Infusión + tostadas con queso y mermelada + ensalada de fruta + jugo de naranja exprimida", available:true },
  { id:"ic_toast",        name:"Valhalla Toast",   category:"Infusiones Calientes", price:10500, description:"Infusión + tostón de campo + palta + queso crema + bacon + omelette", available:true },
  { id:"ic_valkyria",     name:"Valkyria Mix",     category:"Infusiones Calientes", price:8500,  description:"Infusión + 2 panqueques (avellana y banana) + miel + frutas de estación", available:true },
  { id:"ic_yinyan",       name:"Yin & Yan Fit",    category:"Infusiones Calientes", price:10000, description:"Infusión + waffle dulce + pasta de maní + frutas de estación + frutos secos + miel + waffle palta y huevo revuelto", available:true },
  { id:"ic_americano_b",  name:"Americano Brunch", category:"Infusiones Calientes", price:7500,  description:"Infusión + tostada + queso + mermelada + queso tybo + jamón + huevo revuelto + jugo de naranja exprimida", available:true },
  { id:"ic_expresso",     name:"Espresso",         category:"Infusiones Calientes", price:3000,  description:"", available:true },
  { id:"ic_latte",        name:"Latte",            category:"Infusiones Calientes", price:3500,  description:"", available:true },
  { id:"ic_americano",    name:"Americano",        category:"Infusiones Calientes", price:4500,  description:"", available:true },
  { id:"ic_caramelatte",  name:"Caramelatte",      category:"Infusiones Calientes", price:null,  description:"", available:true },
  { id:"ic_macchiato",    name:"Macchiato",        category:"Infusiones Calientes", price:4000,  description:"", available:true },
  { id:"ic_flatwhite",    name:"Flat White",       category:"Infusiones Calientes", price:3500,  description:"", available:true },
  { id:"ic_cappuccino",   name:"Cappuccino",       category:"Infusiones Calientes", price:4500,  description:"", available:true },
  { id:"ic_submarino",    name:"Submarino",        category:"Infusiones Calientes", price:4000,  description:"", available:true },

  // Infusiones Frías
  { id:"if_icelatte",     name:"Iced Latte",       category:"Infusiones Frías", price:null, description:"Café + leche + hielo", available:true },
  { id:"if_caramelatte",  name:"Caramelo Latte",   category:"Infusiones Frías", price:null, description:"Vainilla / Pistacho / Toffi Caramelo / Avellana", available:true },
  { id:"if_affogato",     name:"Affogato",         category:"Infusiones Frías", price:null, description:"Helado de vainilla + shot espresso", available:true },
  { id:"if_cafetonic",    name:"Cafetonic",        category:"Infusiones Frías", price:null, description:"Shot espresso + agua tónica + hielo", available:true },

  // Batidos y Limonadas
  { id:"bl_frozen",       name:"Frozen Limonada",   category:"Batidos y Limonadas", price:5500,  priceLabel:"Vaso", price2:10500, price2Label:"Jarra", description:"Limón + menta + jengibre", available:true },
  { id:"bl_sunshine",     name:"Sunshine Limonada", category:"Batidos y Limonadas", price:6000,  priceLabel:"Vaso", price2:11000, price2Label:"Jarra", description:"Limón + naranja + menta + jengibre", available:true },
  { id:"bl_naranja",      name:"Naranja",           category:"Batidos y Limonadas", price:5500,  description:"Naranja + zanahoria + jengibre", available:true },
  { id:"bl_jugonar",      name:"Jugo de Naranja",   category:"Batidos y Limonadas", price:5000,  description:"Naranja exprimida", available:true },
  { id:"bl_banana",       name:"Banana con Leche",  category:"Batidos y Limonadas", price:6000,  description:"", available:true },
  { id:"bl_tuttiagua",    name:"Tutti con Agua",    category:"Batidos y Limonadas", price:5000,  description:"", available:true },
  { id:"bl_tuttileche",   name:"Tutti con Leche",   category:"Batidos y Limonadas", price:6000,  description:"", available:true },
  { id:"bl_frutagua",     name:"Frutilla con Agua", category:"Batidos y Limonadas", price:6000,  description:"", available:true },
  { id:"bl_frutleche",    name:"Frutilla con Leche",category:"Batidos y Limonadas", price:6000,  description:"", available:true },

  // Tostados y Dulces
  { id:"td_mediajq",      name:"Medialunas J/Q",    category:"Tostados y Dulces", price:2500,  description:"Jamón y queso (precio por unidad)", available:true },
  { id:"td_triple",       name:"Triple J/Q",        category:"Tostados y Dulces", price:4500,  description:"Triple jamón y queso", available:true },
  { id:"td_toston",       name:"Tostón",            category:"Tostados y Dulces", price:8000,  description:"Queso crema + palta + huevo revuelto + tomates cherry + semillas", available:true },
  { id:"td_bagel",        name:"Bagels",            category:"Tostados y Dulces", price:6500,  description:"Huevo + tocino + rúcula + queso tybo", available:true },
  { id:"td_scon",         name:"Scón de Queso",     category:"Tostados y Dulces", price:2500,  description:"", available:true },
  { id:"td_cookies",      name:"Cookies",           category:"Tostados y Dulces", price:3000,  description:"Red Velvet / Chip Choco / Chip Choco Blanco", available:true },
  { id:"td_churros",      name:"Churros",           category:"Tostados y Dulces", price:1000,  description:"", available:true },
  { id:"td_waffles",      name:"Waffles",           category:"Tostados y Dulces", price:null,  description:"", available:true },
  { id:"td_hotcakes",     name:"Hot Cakes Proteicos",category:"Tostados y Dulces", price:null, description:"Avellana + frutas de estación + frutos secos + mantequilla de maní o miel + jugo de naranja exprimido", available:true },
  { id:"td_copadioses",   name:"Copa de Dioses",    category:"Tostados y Dulces", price:5000,  description:"Yogurt + granola + banana + mantequilla de maní + miel", available:true },
  { id:"td_copatent",     name:"Copa Tentación",    category:"Tostados y Dulces", price:4500,  description:"Yogurt + granola + frutas de estación + miel", available:true },

  // Bebidas
  { id:"be_coca",         name:"Coca-Cola 1/2 lt",  category:"Bebidas", price:null, description:"", available:true },
  { id:"be_fanta",        name:"Fanta 1/2 lt",      category:"Bebidas", price:null, description:"", available:true },
  { id:"be_sprite",       name:"Sprite 1/2 lt",     category:"Bebidas", price:null, description:"", available:true },
  { id:"be_aguasabor",    name:"Aguas Saborizadas",  category:"Bebidas", price:null, description:"", available:true },
  { id:"be_cerveza",      name:"Cervezas",           category:"Bebidas", price:null, description:"", available:true },
  { id:"be_vino",         name:"Vinos",              category:"Bebidas", price:null, description:"", available:true },
  { id:"be_fernet",       name:"Medidas de Fernet",  category:"Bebidas", price:null, description:"", available:true },
  { id:"be_daifresa",     name:"Daiquiri Frutilla",  category:"Bebidas", price:null, description:"", available:true },
  { id:"be_daiduraz",     name:"Daiquiri Durazno",   category:"Bebidas", price:null, description:"", available:true },
  { id:"be_ginclas",      name:"Gintonic Clásico",   category:"Bebidas", price:null, description:"", available:true },
  { id:"be_ginduraz",     name:"Gintonic Durazno",   category:"Bebidas", price:null, description:"", available:true },
  { id:"be_ginfresa",     name:"Gintonic Frutilla",  category:"Bebidas", price:null, description:"", available:true },
  { id:"be_mojito",       name:"Mojito",             category:"Bebidas", price:null, description:"", available:true },
  { id:"be_martini",      name:"Martini",            category:"Bebidas", price:null, description:"", available:true },

  // Hamburguesas
  { id:"hb_crispy",       name:"Crispy Valhalla",    category:"Hamburguesas", price:null, description:"Hamburguesa de pollo + lechuga + tomate + cheddar + salsa", available:true },
  { id:"hb_valk",         name:"Valk-Hammer",        category:"Hamburguesas", price:null, description:"Doble medallón de carne + panceta + cheddar + cebolla caramelizada + salsa mil islas + morrón dulce", available:true },

  // Pizzas
  { id:"pz_muzza",        name:"Muzza",              category:"Pizzas", price:null, description:"", available:true },
  { id:"pz_napo",         name:"Napolitana",         category:"Pizzas", price:null, description:"", available:true },
  { id:"pz_especial",     name:"Especial",           category:"Pizzas", price:null, description:"", available:true },
  { id:"pz_anchoa",       name:"Anchoas",            category:"Pizzas", price:null, description:"", available:true },
  { id:"pz_fugazza",      name:"Fugazza",            category:"Pizzas", price:null, description:"", available:true },
  { id:"pz_valhalla",     name:"Valhalla",           category:"Pizzas", price:null, description:"Mediterráneo", available:true },

  // Sandwiches
  { id:"sw_guerrero",     name:"Ciabatta Vacío Guerrero",   category:"Sandwiches", price:null, description:"Lechuga + tomate + lactonesa + vacío guerrero", available:true },
  { id:"sw_berserker",    name:"Ciabatta Vacío Berserker",  category:"Sandwiches", price:null, description:"Lechuga + tomate + cebolla caramelizada + lactonesa", available:true },
  { id:"sw_ragnar",       name:"Ciabatta Vacío Ragnar",     category:"Sandwiches", price:null, description:"Queso tybo + pickles + salsa picante", available:true },
  { id:"sw_odin",         name:"Bondiola Odin",             category:"Sandwiches", price:null, description:"Lechuga + tomate + lactonesa", available:true },
  { id:"sw_loki",         name:"Bondiola Loki",             category:"Sandwiches", price:null, description:"Queso + huevo + cebolla caramelizada", available:true },
  { id:"sw_valhalla",     name:"Bondiola Valhalla",         category:"Sandwiches", price:null, description:"Queso + panceta + huevo + salsa mostaza y miel", available:true },

  // Adicionales
  { id:"ad_barbacoa",     name:"Topping Barbacoa",   category:"Adicionales", price:null, description:"", available:true },
  { id:"ad_moliscas",     name:"Topping Mollejas",   category:"Adicionales", price:null, description:"", available:true },
  { id:"ad_alioli",       name:"Topping Alioli",     category:"Adicionales", price:null, description:"", available:true },
  { id:"ad_chimi",        name:"Topping Chimichurri",category:"Adicionales", price:null, description:"", available:true },
  { id:"ad_malbec",       name:"Reducción Malbec",   category:"Adicionales", price:null, description:"", available:true },
]

export async function seedMenu() {
  const promises = menuData.map(item => setMenuItem(item.id, item))
  await Promise.all(promises)
}
