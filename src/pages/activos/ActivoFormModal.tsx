import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Activo } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ComboboxBusqueda, type ComboboxOpcion } from '@/components/ui/ComboboxBusqueda';
import { Button } from '@/components/ui/Button';
import { categoriasActivo } from '@/constants/formOptions';
import { useEspacios } from '@/hooks/useEspacios';
import { usuariosService } from '@/services/usuariosService';
import { aplicarMascaraMoneda, formatearNumeroMoneda, textoMonedaANumero } from '@/utils/format';
import { generarSiguienteCodigo, validarFormatoCodigo, validarFechaNoFutura } from '@/utils/format';

const schema = z.object({
  nombre: z.string().min(2, 'Ingresá un nombre.'),
  codigo: z.string().min(1, 'Ingresá un código.').refine(validarFormatoCodigo, 'Formato inválido. Use: A-101, B-202 (máx 3 dígitos).'),
  categoria: z.string().min(1, 'Seleccioná una categoría.'),
  espacioId: z.string().min(1, 'Seleccioná un espacio.'),
  cantidad: z.coerce.number().min(1, 'La cantidad debe ser al menos 1.'),
  responsable: z.string().min(2, 'Ingresá el responsable.'),
  valor: z.coerce.number().min(0, 'El valor no puede ser negativo.'),
  estado: z.enum(['BUENO', 'REGULAR', 'DETERIORADO', 'CRITICO']),
  fechaAdquisicion: z.string().min(1, 'Ingresá la fecha de adquisición.').refine(validarFechaNoFutura, 'La fecha no puede ser futura.'),
});

export type ActivoFormValues = z.infer<typeof schema>;

interface ActivoFormModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (valores: ActivoFormValues) => Promise<void>;
  activo?: Activo | null;
}

const valoresVacios: ActivoFormValues = {
  nombre: '', codigo: '', categoria: '', espacioId: '',
  cantidad: 1, responsable: '', valor: 0, estado: 'BUENO',
  fechaAdquisicion: new Date().toISOString().slice(0, 10),
};

interface ResponsableOpcion {
  id: string;
  nombre: string;
  rol: string;
}

export function ActivoFormModal({ abierto, onCerrar, onGuardar, activo }: ActivoFormModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [valorTexto, setValorTexto] = useState('');
  const [responsables, setResponsables] = useState<ResponsableOpcion[]>([]);
  const [cargandoResponsables, setCargandoResponsables] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ActivoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresVacios,
  });
  const { data: espacios = [], isLoading: espaciosLoading } = useEspacios();

  const cargarResponsables = useCallback(async () => {
    setCargandoResponsables(true);
    try {
      const directorio = await usuariosService.directorio();
      // Filtrar solo roles válidos para ser responsables: Inspector, Técnico, Coordinador, Rector, Administrador
      const rolesValidos = ['Inspector', 'Técnico', 'Coordinador', 'Rector', 'Administrador'];
      setResponsables(
        directorio
          .filter((u) => rolesValidos.includes(u.rol))
          .map((u) => ({ id: u.id, nombre: u.nombre, rol: u.rol }))
      );
    } catch (error) {
      console.error('Error cargando responsables:', error);
      setResponsables([]);
    } finally {
      setCargandoResponsables(false);
    }
  }, []);

  useEffect(() => {
    cargarResponsables();
  }, [cargarResponsables]);

  const alCambiarValor = (raw: string, field: { onChange: (v: number) => void }) => {
    const texto = aplicarMascaraMoneda(raw);
    setValorTexto(texto);
    field.onChange(textoMonedaANumero(texto) ?? 0);
  };

  useEffect(() => {
    if (abierto) {
      const valorInicial = activo ? formatearNumeroMoneda(activo.valor) : '';
      setValorTexto(valorInicial);
      if (activo) {
        reset({ ...activo, valor: activo.valor });
      } else {
        // Generar código automático solo para nuevo activo
        const codigosExistentes: string[] = []; // Se podría cargar de la API
        const codigoSugerido = generarSiguienteCodigo(codigosExistentes);
        reset({ ...valoresVacios, codigo: codigoSugerido });
      }
    }
  }, [abierto, activo, reset]);

  const onSubmit = async (valores: ActivoFormValues) => {
    setGuardando(true);
    try {
      const n = textoMonedaANumero(valorTexto);
      await onGuardar({ ...valores, valor: n ?? 0 });
      onCerrar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={activo ? 'Editar activo' : 'Registrar activo'}
      descripcion="Completá la información del activo del inventario."
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)} cargando={guardando}>
            {activo ? 'Guardar cambios' : 'Registrar activo'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre" placeholder="Proyector Epson EB" error={errors.nombre?.message} {...register('nombre')} />
          <Input 
            label="Código" 
            placeholder="TEC-0071" 
            error={errors.codigo?.message} 
            {...register('codigo')} 
            readOnly={!activo}
            title={!activo ? 'El código se genera automáticamente' : ''}
            className={!activo ? 'bg-surface-50 dark:bg-surface-800/60' : ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Categoría"
                placeholder="Buscar categoría…"
                error={errors.categoria?.message}
                opciones={categoriasActivo.map((c): ComboboxOpcion => ({ id: c, etiqueta: c }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="espacioId"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Espacio (Aula real)"
                placeholder="Buscar espacio…"
                error={errors.espacioId?.message}
                opciones={espacios.map((e): ComboboxOpcion => ({ id: e.id, etiqueta: `${e.codigo} · ${e.nombre}`, detalle: e.tipo }))}
                value={field.value}
                onChange={field.onChange}
                disabled={espaciosLoading}
                vacioMensaje={espaciosLoading ? 'Cargando espacios…' : 'No hay espacios disponibles.'}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Cantidad" type="number" min={1} error={errors.cantidad?.message} {...register('cantidad')} />
          <Controller
            control={control}
            name="responsable"
            render={({ field }) => (
              <ComboboxBusqueda
                label="Responsable (rol válido)"
                placeholder="Buscar responsable…"
                error={errors.responsable?.message}
                opciones={responsables.map((r): ComboboxOpcion => ({ id: r.nombre, etiqueta: r.nombre, detalle: r.rol }))}
                value={field.value}
                onChange={field.onChange}
                disabled={cargandoResponsables}
                vacioMensaje={cargandoResponsables ? 'Cargando responsables…' : 'No hay responsables con rol válido'}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="valor"
            render={({ field }) => (
              <Input
                label="Valor (COP)"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ej.: 1.500.000,50"
                error={errors.valor?.message}
                value={valorTexto}
                onChange={(e) => alCambiarValor(e.target.value, { onChange: field.onChange })}
              />
            )}
          />
          <Input label="Fecha de adquisición" type="date" error={errors.fechaAdquisicion?.message} {...register('fechaAdquisicion')} />
        </div>

        <Controller
          control={control}
          name="estado"
          render={({ field }) => (
            <Select label="Estado" value={field.value} onChange={field.onChange}>
              <option value="BUENO">Bueno</option>
              <option value="REGULAR">Regular</option>
              <option value="DETERIORADO">Deteriorado</option>
              <option value="CRITICO">Crítico</option>
            </Select>
          )}
        />
      </div>
    </Modal>
  );
}