export interface Mayorista {
  id: string;
  nombre: string;
  rubro: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { productos: number };
}

export interface Producto {
  id: string;
  codigo: string;
  descripcion: string;
  precio: number;
  mayoristaId: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt: string;
}

export interface Pedido {
  id: string;
  numero: string;
  observaciones?: string;
  estado: string;
  descuentoPct: number;
  total: number;
  cliente?: Cliente;
  mayorista: Mayorista;
  items: PedidoItemConProducto[];
  createdAt: string;
}

export interface PedidoItemConProducto {
  id?: string;
  cantidad: number;
  cantidadRegalo: number;
  precioUnitario: number;
  descuentoPct: number;
  productoId: string;
  producto: Producto;
}

export interface PedidoItemInput {
  cantidad: number;
  cantidadRegalo: number;
  precioUnitario: number;
  descuentoPct: number;
  productoId: string;
}
