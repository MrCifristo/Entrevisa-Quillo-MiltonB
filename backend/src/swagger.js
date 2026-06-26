import swaggerJSDoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'API de Gestión de Turnos',
    version: '1.0.0',
    description:
      'Backend para gestionar empleados, turnos y sus asignaciones (relación muchos-a-muchos).',
  },
  servers: [{ url: '/' }],
  components: {
    schemas: {
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          employee_number: { type: 'string', example: 'EMP-001' },
          full_name: { type: 'string', example: 'Ana López' },
          email: { type: 'string', example: 'ana@empresa.com' },
          phone: { type: 'string', example: '+502 5555-1111' },
          dpi: { type: 'string', example: '1234567890101' },
        },
      },
      EmployeeInput: {
        type: 'object',
        required: ['employee_number', 'full_name', 'email', 'phone', 'dpi'],
        properties: {
          employee_number: { type: 'string', example: 'EMP-001' },
          full_name: { type: 'string', example: 'Ana López' },
          email: { type: 'string', example: 'ana@empresa.com' },
          phone: { type: 'string', example: '+502 5555-1111' },
          dpi: { type: 'string', example: '1234567890101' },
        },
      },
      Shift: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          type: { type: 'string', enum: ['morning', 'afternoon', 'night'], example: 'morning' },
          description: { type: 'string', example: 'Front desk' },
          is_workable: { type: 'boolean', example: true },
          start_time: { type: 'string', example: '08:00' },
          end_time: { type: 'string', example: '16:00' },
          day_of_week: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            example: 'Monday',
          },
        },
      },
      ShiftInput: {
        type: 'object',
        required: ['type', 'description', 'start_time', 'end_time', 'day_of_week'],
        properties: {
          type: { type: 'string', enum: ['morning', 'afternoon', 'night'], example: 'morning' },
          description: { type: 'string', example: 'Front desk' },
          is_workable: { type: 'boolean', example: true },
          start_time: { type: 'string', example: '08:00' },
          end_time: { type: 'string', example: '16:00' },
          day_of_week: {
            type: 'string',
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            example: 'Monday',
          },
        },
      },
      AssignmentInput: {
        type: 'object',
        required: ['employee_id', 'shift_id'],
        properties: {
          employee_id: { type: 'integer', example: 1 },
          shift_id: { type: 'integer', example: 1 },
        },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Mensaje de error' } },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition,
  apis: ['./src/routes/*.js'],
});
