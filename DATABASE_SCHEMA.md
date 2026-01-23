# Database Schema

> **Note:** Sourced from user prompt as PROJECT_CONTEXT.md was empty.

## Overview
This schema serves as the Single Source of Truth for the application's data structure.

## Tables

### profiles
*User profiles and authentication details.*
*   `full_name`: text
*   `node`: text (Nodo o estado: Hidalgo, CDMX, etc)
*   `role`: 'admin', 'coordinator', 'volunteer'

### projects
*Gestión anual (Annual management projects).*
*   `latitude`: float (Optional)
*   `longitude`: float (Optional)

### agenda_activities
*Encuentro (Meetings and agenda items).*
*   `status`: 'red', 'yellow', 'green' (Semáforo).
*   `latitude`: float (Optional)
*   `longitude`: float (Optional)
*   `agreements`: Acuerdos tomados (Report Module).
*   `report_details`: Detalles para el reporte (Report Module).
*   `logistics_instructions`: Instrucciones logísticas (Logistics Module).
*   `impact_metric_value`: num (KPI qty).
*   `impact_metric_unit`: text (KPI unit).

### sub_blocks
*Logística (Logistcs and sub-blocks for activities).*

### finances
*Financial records and project budgets.*

### activity_assignments
*Responsabilidades (Assignments of activities to profiles).*

### personal_tasks
*Notas privadas (Private tasks and notes for users).*

### evidence
*Multimedia de campo (Google Drive links, images, etc).*
*   `file_url`: Link al recurso.
*   `file_type`: 'image', 'video', 'audio', 'document'.
*   `uploaded_by`: Usuario que subió el archivo.

### announcements
*Global or project-specific announcements.*

### audit_logs
*   `id`: uuid (PK)
*   `table_name`: text
*   `record_id`: uuid
*   `action`: text ('INSERT', 'UPDATE', 'DELETE')
*   `old_data`: jsonb (Optional)
*   `new_data`: jsonb (Optional)
*   `performed_by`: uuid (FK -> profiles.id)
*   `created_at`: timestamps
