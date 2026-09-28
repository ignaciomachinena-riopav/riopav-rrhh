import * as XLSX from 'xlsx';
import { Employee, LeaveRecord, Holiday, LeaveType } from '../types';
import { formatDateShort, getDatesInRange, MONTH_NAMES_ES, parseDateISO, calculateVacationDaysBySeniority } from './dateUtils';
import { getLeaveTypeConfig } from '../data/initialData';

// Helper para guardar archivo Excel
function saveWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename);
}

// 1. Exportar Nómina Completa de Empleados
export function exportEmployeesToExcel(employees: Employee[], leaves: LeaveRecord[]) {
  const currentYear = new Date().getFullYear().toString();

  const data = employees.map(emp => {
    // Calcular días usados en el año (solo hábiles lun-vie restan)
    const empLeaves = leaves.filter(l => 
      l.employeeId === emp.id && 
      l.status === 'aprobado' &&
      l.startDate.startsWith(currentYear)
    );

    const licTaken = empLeaves
      .filter(l => l.type === 'licencia')
      .reduce((sum, l) => sum + l.businessDays, 0);

    const studyTaken = empLeaves
      .filter(l => l.type === 'estudio')
      .reduce((sum, l) => sum + l.businessDays, 0);

    const fullName = emp.fullName || `${emp.lastName}, ${emp.firstName}`;

    return {
      'Nombre Completo': fullName,
      'Tipo Doc': emp.documentType,
      'Nº Documento (CI o DNI)': emp.documentNumber,
      'Área': emp.department,
      'Estado': emp.status === 'activo' ? 'Activo' : 'Inactivo',
      '¿Es Estudiante?': emp.isStudent ? 'Sí' : 'No',
      'Días Vacaciones Anuales': emp.vacationDaysTotal,
      'Días Vacaciones Gozados (Lun-Vie)': licTaken,
      'Días Vacaciones Restantes': Math.max(0, emp.vacationDaysTotal - licTaken),
      'Días Estudio Anuales': emp.isStudent ? emp.studyDaysTotal : 'No aplica',
      'Días Estudio Tomados (No restan de vacaciones)': emp.isStudent ? studyTaken : 0,
      'Días Estudio Restantes': emp.isStudent ? Math.max(0, emp.studyDaysTotal - studyTaken) : 'No aplica'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ajuste de anchos de columna
  worksheet['!cols'] = [
    { wch: 26 }, { wch: 10 }, { wch: 18 }, { wch: 18 },
    { wch: 14 }, { wch: 10 }, { wch: 22 }, { wch: 24 },
    { wch: 22 }, { wch: 20 }, { wch: 30 }, { wch: 20 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nómina Empleados');
  saveWorkbook(workbook, `Nomina_Empleados_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// 2. Exportar Registro de Licencias y Estudios
export function exportLeavesToExcel(leaves: LeaveRecord[], employees: Employee[]) {
  const empMap = new Map<string, Employee>();
  employees.forEach(e => empMap.set(e.id, e));

  const data = leaves.map(leave => {
    const emp = empMap.get(leave.employeeId);
    const typeLabel = getLeaveTypeConfig(leave.type)?.label || leave.type;

    return {
      'Tipo Doc': emp?.documentType || 'DNI',
      'Nº Documento (DNI)': emp?.documentNumber || 'S/D',
      'Empleado': emp ? `${emp.lastName}, ${emp.firstName}` : 'Desconocido',
      'Departamento': emp?.department || '',
      'Tipo Ausencia': typeLabel,
      'Fecha Inicio': formatDateShort(leave.startDate),
      'Fecha Fin': formatDateShort(leave.endDate),
      'Días Hábiles': leave.businessDays,
      'Días Corridos': leave.totalCalendarDays,
      'Estado': leave.status.toUpperCase(),
      'Materia / Examen (Estudio)': leave.examSubject || '-',
      'Detalle / Certificado': leave.medicalCertificate || '-',
      'Motivo / Observaciones': leave.notes || '',
      'Fecha Solicitud': formatDateShort(leave.createdAt)
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 18 }, { wch: 24 }, { wch: 22 },
    { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 25 },
    { wch: 35 }, { wch: 14 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Licencias y Estudios');
  saveWorkbook(workbook, `Reporte_Licencias_RRHH_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// 3. Exportar Matriz Mensual de Asistencia / Licencias (Cronograma Visual en Excel)
export function exportMonthlyAttendanceMatrixToExcel(
  year: number,
  month: number, // 0-11
  employees: Employee[],
  leaves: LeaveRecord[],
  holidays: Holiday[]
) {
  const monthName = MONTH_NAMES_ES[month];
  const lastDay = new Date(year, month + 1, 0).getDate();
  const holidayMap = new Map<string, Holiday>();
  holidays.forEach(h => holidayMap.set(h.date, h));

  const matrixData: Record<string, string | number>[] = [];

  employees.forEach(emp => {
    const row: Record<string, string | number> = {
      'DNI': emp.documentNumber,
      'Empleado': `${emp.lastName}, ${emp.firstName}`,
      'Departamento': emp.department
    };

    let totalLicDays = 0;
    let totalStudyDays = 0;

    for (let day = 1; day <= lastDay; day++) {
      const d = new Date(year, month, day);
      const yyyy = year;
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const colName = `Día ${day}`;

      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = holidayMap.get(dateStr);

      // Check if employee has leave on this day
      const activeLeave = leaves.find(l => 
        l.employeeId === emp.id && 
        l.status !== 'rechazado' &&
        dateStr >= l.startDate && 
        dateStr <= l.endDate
      );

      if (activeLeave) {
        if (activeLeave.type === 'estudio') {
          row[colName] = 'EST';
          totalStudyDays++;
        } else {
          row[colName] = 'LIC';
          totalLicDays++;
        }
      } else if (holiday) {
        row[colName] = 'FER';
      } else if (isWeekend) {
        row[colName] = 'FIN';
      } else {
        row[colName] = 'PRES'; // Presente / Laborable
      }
    }

    row['Total Licencias'] = totalLicDays;
    row['Total Días Estudio'] = totalStudyDays;
    row['Total Ausencias'] = totalLicDays + totalStudyDays;

    matrixData.push(row);
  });

  const worksheet = XLSX.utils.json_to_sheet(matrixData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Cronograma ${monthName} ${year}`);

  // Agregar hoja de referencias
  const legendData = [
    { 'Código': 'LIC', 'Significado': 'Licencia' },
    { 'Código': 'EST', 'Significado': 'Día de Estudio' },
    { 'Código': 'FER', 'Significado': 'Feriado Nacional / Provincial / Asueto' },
    { 'Código': 'FIN', 'Significado': 'Fin de Semana (Sábado / Domingo)' },
    { 'Código': 'PRES', 'Significado': 'Día Hábil / Presente' }
  ];
  const legendSheet = XLSX.utils.json_to_sheet(legendData);
  XLSX.utils.book_append_sheet(workbook, legendSheet, 'Referencias');

  saveWorkbook(workbook, `Cronograma_RRHH_${monthName}_${year}.xlsx`);
}

// 4. Exportar Libro Completo con todas las tablas
export function exportFullComprehensiveExcel(
  employees: Employee[],
  leaves: LeaveRecord[],
  holidays: Holiday[]
) {
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Nómina
  const empData = employees.map(e => ({
    'Tipo Doc': e.documentType,
    'DNI / Documento': e.documentNumber,
    'Apellido': e.lastName,
    'Nombre': e.firstName,
    'Email': e.email,
    'Teléfono': e.phone,
    'Departamento': e.department,
    'Cargo': e.role,
    'Estado': e.status,
    '¿Es Estudiante?': e.isStudent ? 'Sí' : 'No',
    'Días Vacaciones Anuales': e.vacationDaysTotal,
    'Días Estudio Anuales': e.isStudent ? e.studyDaysTotal : 0
  }));
  const wsEmp = XLSX.utils.json_to_sheet(empData);
  XLSX.utils.book_append_sheet(workbook, wsEmp, 'Empleados');

  // Hoja 2: Licencias
  const empMap = new Map(employees.map(e => [e.id, e]));
  const leaveData = leaves.map(l => {
    const emp = empMap.get(l.employeeId);
    return {
      'DNI': emp?.documentNumber || '',
      'Empleado': emp ? `${emp.lastName}, ${emp.firstName}` : '',
      'Tipo': getLeaveTypeConfig(l.type)?.label || l.type,
      'Fecha Inicio': l.startDate,
      'Fecha Fin': l.endDate,
      'Días Hábiles': l.businessDays,
      'Días Corridos': l.totalCalendarDays,
      'Estado': l.status,
      'Materia Estudio': l.examSubject || '',
      'Detalle / Certificado': l.medicalCertificate || '',
      'Notas': l.notes || ''
    };
  });
  const wsLeaves = XLSX.utils.json_to_sheet(leaveData);
  XLSX.utils.book_append_sheet(workbook, wsLeaves, 'Licencias y Estudios');

  // Hoja 3: Feriados
  const holidayData = holidays.map(h => ({
    'Fecha': h.date,
    'Nombre Feriado': h.name,
    'Tipo': h.type,
    'Descripción': h.description || ''
  }));
  const wsHolidays = XLSX.utils.json_to_sheet(holidayData);
  XLSX.utils.book_append_sheet(workbook, wsHolidays, 'Feriados');

  saveWorkbook(workbook, `Sistema_RRHH_Completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// 5. Descargar Plantillas de Ejemplo para Cargar
export function downloadEmployeeTemplate() {
  const sampleData = [
    {
      'Nombre Completo': 'Martina Gómez Silva',
      'Tipo Doc': 'CI',
      'Nº Documento (CI o DNI)': '4.892.102-1',
      'Área (Backoffice, Legales, Mesa, Administración)': 'Backoffice',
      '¿Es Estudiante? (Sí/No)': 'No',
      'Días Vacaciones Anuales': 20,
      'Días Estudio Anuales': 0
    },
    {
      'Nombre Completo': 'Santiago Rossi',
      'Tipo Doc': 'DNI',
      'Nº Documento (CI o DNI)': '38.109.542',
      'Área (Backoffice, Legales, Mesa, Administración)': 'Backoffice',
      '¿Es Estudiante? (Sí/No)': 'Sí',
      'Días Vacaciones Anuales': 20,
      'Días Estudio Anuales': 10
    },
    {
      'Nombre Completo': 'Gonzalo Méndez',
      'Tipo Doc': 'CI',
      'Nº Documento (CI o DNI)': '3.712.980-4',
      'Área (Backoffice, Legales, Mesa, Administración)': 'Mesa',
      '¿Es Estudiante? (Sí/No)': 'No',
      'Días Vacaciones Anuales': 23,
      'Días Estudio Anuales': 0
    },
    {
      'Nombre Completo': 'Sofía Morales',
      'Tipo Doc': 'DNI',
      'Nº Documento (CI o DNI)': '42.330.981',
      'Área (Backoffice, Legales, Mesa, Administración)': 'Legales',
      '¿Es Estudiante? (Sí/No)': 'Sí',
      'Días Vacaciones Anuales': 20,
      'Días Estudio Anuales': 10
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Empleados');
  saveWorkbook(wb, 'Plantilla_Carga_Empleados.xlsx');
}

export function downloadLeaveTemplate() {
  const sampleData = [
    {
      'DNI Empleado': '38.452.120',
      'Tipo Licencia': 'estudio', // 'estudio' o 'licencia'
      'Fecha Inicio (AAAA-MM-DD)': '2026-10-15',
      'Fecha Fin (AAAA-MM-DD)': '2026-10-16',
      'Materia o Examen': 'Derecho Laboral - UBA',
      'Certificado / Detalle': '',
      'Notas': 'Rinde examen de grado'
    },
    {
      'DNI Empleado': '40.119.882',
      'Tipo Licencia': 'licencia',
      'Fecha Inicio (AAAA-MM-DD)': '2026-11-02',
      'Fecha Fin (AAAA-MM-DD)': '2026-11-13',
      'Materia o Examen': '',
      'Certificado / Detalle': 'Licencia anual por descanso',
      'Notas': 'Primer tramo de licencia'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Licencias');
  saveWorkbook(wb, 'Plantilla_Carga_Licencias_Estudios.xlsx');
}

export function downloadHolidayTemplate() {
  const sampleData = [
    {
      'Fecha (AAAA-MM-DD)': '2026-09-21',
      'Nombre Feriado': 'Día del Empleado de Comercio / Día de la Primavera',
      'Tipo (nacional/provincial/empresa)': 'empresa',
      'Descripción': 'Asueto institucional para el equipo'
    },
    {
      'Fecha (AAAA-MM-DD)': '2026-12-24',
      'Nombre Feriado': 'Víspera de Navidad',
      'Tipo (nacional/provincial/empresa)': 'empresa',
      'Descripción': 'Asueto especial de fin de año'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Feriados');
  saveWorkbook(wb, 'Plantilla_Carga_Feriados.xlsx');
}

// 6. Importar Empleados desde Archivo Excel o CSV
export async function parseEmployeesExcel(file: File): Promise<{
  success: boolean;
  employees: Partial<Employee>[];
  errors: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          resolve({ success: false, employees: [], errors: ['El archivo Excel está vacío o no tiene filas válidas.'] });
          return;
        }

        const employees: Partial<Employee>[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          // Mapeo flexible de columnas
          const docNum = row['Nº Documento (CI o DNI)'] || row['Nº Documento'] || row['Nº Documento (DNI)'] || row['DNI'] || row['CI'] || row['Documento'] || row['documentNumber'] || '';
          
          let rawFullName = row['Nombre Completo'] || row['fullName'] || '';
          let lastName = row['Apellido'] || row['lastName'] || '';
          let firstName = row['Nombre'] || row['firstName'] || '';

          if (!rawFullName && (firstName || lastName)) {
            rawFullName = `${firstName} ${lastName}`.trim();
          }

          if (rawFullName && (!firstName || !lastName)) {
            const parts = String(rawFullName).trim().split(/\s+/);
            if (parts.length > 1) {
              lastName = parts[parts.length - 1];
              firstName = parts.slice(0, -1).join(' ');
            } else {
              firstName = parts[0] || 'Colaborador';
              lastName = '';
            }
          }
          
          if (!docNum && !rawFullName) {
            return; // fila vacía
          }

          if (!docNum) {
            errors.push(`Fila ${rowNum}: Falta el número de documento (CI o DNI).`);
            return;
          }

          if (!rawFullName) {
            errors.push(`Fila ${rowNum} (Doc ${docNum}): Debe especificar el Nombre Completo.`);
            return;
          }

          const colors = ['#4f46e5', '#0891b2', '#059669', '#ea580c', '#2563eb', '#7c3aed', '#db2777', '#d97706'];
          const avatarColor = colors[Math.floor(Math.random() * colors.length)];

          let hireDate = row['Fecha Ingreso (AAAA-MM-DD)'] || row['Fecha Ingreso'] || row['Fecha de Ingreso'] || row['hireDate'] || '';
          // Si Excel devuelve un número serial de fecha
          if (typeof hireDate === 'number') {
            const dateObj = XLSX.SSF.parse_date_code(hireDate);
            if (dateObj) {
              hireDate = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
            }
          }
          if (!hireDate) {
            hireDate = new Date().toISOString().slice(0, 10);
          }

          // Detección o cálculo de días de vacaciones por antigüedad
          const seniorityCalc = calculateVacationDaysBySeniority(hireDate);
          const rawVacation = row['Días Vacaciones Anuales'] || row['Días Licencia'] || row['Vacaciones Anuales'] || row['Días Vacaciones'];
          const vacationDaysTotal = rawVacation !== undefined ? Number(rawVacation) : seniorityCalc.vacationDays;

          // Detección de condición de estudiante
          const rawStudent = row['¿Es Estudiante? (Sí/No)'] || row['¿Es Estudiante?'] || row['Estudiante (Sí/No)'] || row['Estudiante'] || row['isStudent'];
          let isStudent = false;
          if (rawStudent !== undefined && rawStudent !== null && String(rawStudent).trim() !== '') {
            const sStr = String(rawStudent).trim().toLowerCase();
            isStudent = sStr === 'si' || sStr === 'sí' || sStr === 'yes' || sStr === 'true' || sStr === '1' || sStr === 's';
          } else {
            // Si no se incluyó la columna explícita pero cargó días de estudio > 0
            const rawStudy = row['Días Estudio Anuales'] || row['Días Estudio'];
            if (rawStudy !== undefined && Number(rawStudy) > 0) {
              isStudent = true;
            }
          }

          const rawStudyDays = row['Días Estudio Anuales'] || row['Días Estudio'];
          const studyDaysTotal = isStudent 
            ? (rawStudyDays !== undefined && !isNaN(Number(rawStudyDays)) ? Number(rawStudyDays) : 10) 
            : 0;

          // Área permitida (Backoffice, Legales, Mesa, Administración)
          const rawArea = String(row['Área (Backoffice, Legales, Mesa, Administración)'] || row['Área'] || row['Area'] || row['Departamento'] || 'Backoffice').trim();
          let department = 'Backoffice';
          if (/legales|legal/i.test(rawArea)) department = 'Legales';
          else if (/mesa/i.test(rawArea)) department = 'Mesa';
          else if (/admin|finan/i.test(rawArea)) department = 'Administración';
          else if (/back|operac|tecno/i.test(rawArea)) department = 'Backoffice';

          // Tipo de documento: CI o DNI
          const rawDocType = String(row['Tipo Doc'] || row['Tipo Documento'] || (String(docNum).includes('-') ? 'CI' : 'DNI')).toUpperCase();
          const docType = rawDocType.includes('CI') || rawDocType.includes('CÉDULA') ? 'CI' : 'DNI';

          employees.push({
            id: `emp-imp-${Date.now()}-${index}`,
            documentType: docType as any,
            documentNumber: String(docNum).trim(),
            fullName: String(rawFullName).trim(),
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: String(row['Email'] || `${firstName.toLowerCase().replace(/\s+/g, '')}.${(lastName || 'colab').toLowerCase().replace(/\s+/g, '')}@empresa.com`),
            phone: String(row['Teléfono'] || row['Telefono'] || ''),
            department,
            role: department,
            hireDate,
            avatarColor,
            vacationDaysTotal,
            isStudent,
            studyDaysTotal,
            status: (String(row['Estado'] || 'activo').toLowerCase().includes('inact') ? 'inactivo' : 'activo'),
            notes: row['Observaciones'] || row['Notas'] || ''
          });
        });

        resolve({
          success: employees.length > 0,
          employees,
          errors
        });
      } catch (err: any) {
        resolve({ success: false, employees: [], errors: [`Error al procesar el archivo: ${err.message}`] });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, employees: [], errors: ['No se pudo leer el archivo.'] });
    };
    reader.readAsArrayBuffer(file);
  });
}

// 7. Importar Licencias desde Excel
export async function parseLeavesExcel(
  file: File,
  employees: Employee[]
): Promise<{
  success: boolean;
  leaves: Partial<LeaveRecord>[];
  errors: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          resolve({ success: false, leaves: [], errors: ['El archivo no contiene filas con datos.'] });
          return;
        }

        const leaves: Partial<LeaveRecord>[] = [];
        const errors: string[] = [];

        // Normalizar mapa de empleados por DNI limpio y por nombre
        const dniMap = new Map<string, Employee>();
        const nameMap = new Map<string, Employee>();

        employees.forEach(emp => {
          const cleanDni = emp.documentNumber.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
          dniMap.set(cleanDni, emp);
          nameMap.set(`${emp.lastName.toLowerCase()} ${emp.firstName.toLowerCase()}`, emp);
          nameMap.set(`${emp.firstName.toLowerCase()} ${emp.lastName.toLowerCase()}`, emp);
        });

        rawJson.forEach((row, index) => {
          const rowNum = index + 2;
          const rawDni = String(row['DNI Empleado'] || row['DNI'] || row['Nº Documento'] || '').trim();
          const rawName = String(row['Empleado'] || row['Nombre'] || '').trim().toLowerCase();

          let targetEmp: Employee | undefined;
          if (rawDni) {
            const clean = rawDni.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
            targetEmp = dniMap.get(clean);
          }
          if (!targetEmp && rawName) {
            targetEmp = nameMap.get(rawName);
          }

          if (!targetEmp) {
            errors.push(`Fila ${rowNum}: No se encontró un empleado registrado con DNI/Nombre "${rawDni || rawName}".`);
            return;
          }

          let startStr = row['Fecha Inicio (AAAA-MM-DD)'] || row['Fecha Inicio'] || row['startDate'] || '';
          let endStr = row['Fecha Fin (AAAA-MM-DD)'] || row['Fecha Fin'] || row['endDate'] || startStr;

          if (typeof startStr === 'number') {
            const d = XLSX.SSF.parse_date_code(startStr);
            if (d) startStr = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
          }
          if (typeof endStr === 'number') {
            const d = XLSX.SSF.parse_date_code(endStr);
            if (d) endStr = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
          }

          if (!startStr) {
            errors.push(`Fila ${rowNum}: Falta la fecha de inicio.`);
            return;
          }
          if (!endStr) endStr = startStr;

          // Normalizar tipo de licencia: solo 'estudio' o 'licencia'
          const rawType = String(row['Tipo Licencia'] || row['Tipo'] || 'licencia').toLowerCase();
          const type: LeaveType = (rawType.includes('estudio') || rawType.includes('examen')) ? 'estudio' : 'licencia';

          const dates = getDatesInRange(startStr, endStr);

          leaves.push({
            id: `leave-imp-${Date.now()}-${index}`,
            employeeId: targetEmp.id,
            type,
            startDate: startStr,
            endDate: endStr,
            businessDays: dates.length,
            totalCalendarDays: dates.length,
            status: 'aprobado',
            notes: row['Notas'] || row['Motivo'] || '',
            examSubject: row['Materia o Examen'] || row['Materia'] || '',
            medicalCertificate: row['Certificado / Detalle'] || row['Certificado Médico'] || row['Certificado'] || row['Detalle'] || '',
            createdAt: new Date().toISOString().slice(0, 10)
          });
        });

        resolve({
          success: leaves.length > 0,
          leaves,
          errors
        });
      } catch (err: any) {
        resolve({ success: false, leaves: [], errors: [`Error al procesar: ${err.message}`] });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, leaves: [], errors: ['No se pudo leer el archivo.'] });
    };
    reader.readAsArrayBuffer(file);
  });
}

// 8. Importar Feriados desde Excel
export async function parseHolidaysExcel(file: File): Promise<{
  success: boolean;
  holidays: Holiday[];
  errors: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          resolve({ success: false, holidays: [], errors: ['El archivo no contiene registros de feriados.'] });
          return;
        }

        const holidays: Holiday[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2;
          let dateStr = row['Fecha (AAAA-MM-DD)'] || row['Fecha'] || row['date'] || '';
          if (typeof dateStr === 'number') {
            const d = XLSX.SSF.parse_date_code(dateStr);
            if (d) dateStr = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
          }

          const name = row['Nombre Feriado'] || row['Nombre'] || row['Feriado'] || '';
          if (!dateStr || !name) {
            errors.push(`Fila ${rowNum}: Debe indicar Fecha y Nombre del feriado.`);
            return;
          }

          let rawType = String(row['Tipo (nacional/provincial/empresa)'] || row['Tipo'] || 'empresa').toLowerCase();
          let type: Holiday['type'] = 'empresa';
          if (rawType.includes('nacion')) type = 'nacional';
          else if (rawType.includes('provinc')) type = 'provincial';
          else if (rawType.includes('puente')) type = 'puente';

          holidays.push({
            id: `hol-imp-${Date.now()}-${index}`,
            date: dateStr,
            name: String(name).trim(),
            type,
            description: row['Descripción'] || row['Descripcion'] || ''
          });
        });

        resolve({
          success: holidays.length > 0,
          holidays,
          errors
        });
      } catch (err: any) {
        resolve({ success: false, holidays: [], errors: [`Error: ${err.message}`] });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, holidays: [], errors: ['No se pudo leer el archivo.'] });
    };
    reader.readAsArrayBuffer(file);
  });
}
