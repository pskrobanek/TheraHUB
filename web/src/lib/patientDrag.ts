// Přetažení pacienta z menu na aplikaci: aplikace se otevře v novém okně rovnou s profilem pacienta.
import { useState, type DragEvent } from 'react';
import { patients } from '../data/demo';
import type { CatalogApp } from '../data/types';
import { openExternalApp } from './launch';

export const PATIENT_MIME = 'application/x-therahub-patient';

/** Vlastnosti pro tažený prvek pacienta (podzáložka v menu). */
export function patientDragProps(patientId: string, name: string) {
  return {
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData(PATIENT_MIME, patientId);
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.effectAllowed = 'copy';
      document.body.classList.add('dragging-patient');
    },
    onDragEnd: () => document.body.classList.remove('dragging-patient'),
  };
}

const hasPatient = (e: DragEvent) => Array.from(e.dataTransfer.types).includes(PATIENT_MIME);

/** Cíl pro puštění pacienta: vrací vlastnosti prvku a příznak, že je pacient právě nad ním. */
export function usePatientDrop(app: CatalogApp) {
  const [over, setOver] = useState(false);
  return {
    over,
    dropProps: {
      onDragOver: (e: DragEvent) => {
        if (!hasPatient(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (!over) setOver(true);
      },
      onDragLeave: (e: DragEvent) => {
        if (!(e.currentTarget as Node).contains(e.relatedTarget as Node)) setOver(false);
      },
      onDrop: (e: DragEvent) => {
        if (!hasPatient(e)) return;
        e.preventDefault();
        setOver(false);
        document.body.classList.remove('dragging-patient');
        const p = patients.find((x) => x.id === e.dataTransfer.getData(PATIENT_MIME));
        if (p) openExternalApp(app, p);
      },
    },
  };
}
