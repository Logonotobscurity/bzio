# Requirements Document

## Introduction

This specification defines the requirements for a comprehensive audit system that validates the alignment between services, repositories, and JSON data files in a TypeScript/Next.js backend. The audit will produce a structured inventory report identifying missing mappings, duplicate artifacts, schema mismatches, and structural issues across the data layer.

## Glossary

- **Audit_System**: The automated analysis process that examines service-to-JSON mappings
- **JSON_Data_File**: A JSON file in `src/lib/data/` used as seed/config/data source
- **Service_Layer**: TypeScript services in `src/services/` that implement business logic
- **Repository_Layer**: Data access layer in `src/repositories/` (both static and db)
- **Static_Repository**: Repository that reads from JSON data files
- **DB_Repository**: Repository that reads from Prisma/database
- **Schema_File**: TypeScript type definitions or Zod schemas defining data shapes
- **Logical_Table**: A conceptual data entity represented by a JSON file

## Requirements

### Requirement 1: JSON Data File Inventory

**User Story:** As a backend architect, I want to inventory all JSON data files and their mappings, so that I can verify complete coverage across the data layer.

#### Acceptance Criteria

1. WHEN the Audit_System scans `src/lib/data/`, THE Audit_System SHALL list all JSON files with their inferred table/model names
2. WHEN the Audit_System analyzes a JSON file, THE Audit_System SHALL infer the related schema file path
3. WHEN the Audit_System analyzes a JSON file, THE Audit_System SHALL infer the related repository file path (both static and db)
4. WHEN the Audit_System analyzes a JSON file, THE Audit_System SHALL infer the related service file path
5. FOR each JSON file, THE Audit_System SHALL report status: OK, Missing_Schema, Missing_Repo, Missing_Service, or Unused_JSON

### Requirement 2: Required Field Validation

**User Story:** As a backend architect, I want to validate that JSON data files contain all required fields, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN the Audit_System examines a JSON data file, THE Audit_System SHALL extract the field names from each record
2. WHEN the Audit_System compares JSON fields to schema definitions, THE Audit_System SHALL report missing required fields
3. WHEN the Audit_System compares JSON fields to schema definitions, THE Audit_System SHALL report extra fields not in schema
4. IF a JSON file has records with inconsistent field sets, THEN THE Audit_System SHALL report the inconsistency
5. THE Audit_System SHALL produce a checklist of required fields per JSON data file

### Requirement 3: Service-to-JSON Mapping Automation

**User Story:** As a backend architect, I want to automatically map services to their JSON data sources, so that I can verify data flow completeness.

#### Acceptance Criteria

1. WHEN the Audit_System analyzes a service file, THE Audit_System SHALL detect which JSON files it imports or references
2. WHEN the Audit_System analyzes a repository file, THE Audit_System SHALL detect which JSON files it reads from
3. THE Audit_System SHALL produce a mapping table: Service → Repository → JSON_File → Schema
4. IF a service references a JSON file without going through a repository, THEN THE Audit_System SHALL flag the layering violation
5. IF a repository is not used by any service, THEN THE Audit_System SHALL flag it as potentially unused

### Requirement 4: JSON Schema Validation

**User Story:** As a backend architect, I want to validate JSON data against TypeScript/Zod schemas, so that type safety is maintained.

#### Acceptance Criteria

1. WHEN the Audit_System finds a schema for a JSON file, THE Audit_System SHALL validate each record against the schema
2. WHEN validation fails, THE Audit_System SHALL report the specific field and record that failed
3. IF no schema exists for a JSON file, THEN THE Audit_System SHALL recommend creating one
4. WHEN the Audit_System validates schemas, THE Audit_System SHALL check for type mismatches (string vs number, optional vs required)
5. THE Audit_System SHALL support both TypeScript interfaces and Zod schemas

### Requirement 5: Missing Entry Detection Script

**User Story:** As a backend architect, I want a script to detect missing service entries in JSON files, so that I can identify data gaps.

#### Acceptance Criteria

1. THE Audit_System SHALL generate a TypeScript script that can be run to detect missing entries
2. WHEN the script runs, THE script SHALL compare service expectations against JSON file contents
3. WHEN the script finds missing entries, THE script SHALL output the missing entry identifiers
4. THE script SHALL support configurable comparison keys (id, slug, name, etc.)
5. THE script SHALL output results in both console and JSON format

### Requirement 6: Duplicate and Unused Artifact Detection

**User Story:** As a backend architect, I want to detect duplicate and unused artifacts, so that I can clean up the codebase.

#### Acceptance Criteria

1. WHEN the Audit_System scans JSON files, THE Audit_System SHALL detect duplicate or near-duplicate files (same or overlapping content)
2. WHEN the Audit_System scans services, THE Audit_System SHALL detect duplicate or redundant services doing the same thing
3. WHEN the Audit_System scans repositories, THE Audit_System SHALL detect unused repository functions
4. THE Audit_System SHALL identify JSON files that are never imported or read
5. THE Audit_System SHALL identify dead code related to data flows

### Requirement 7: Naming Consistency Validation

**User Story:** As a backend architect, I want to verify naming consistency across layers, so that the codebase is maintainable.

#### Acceptance Criteria

1. WHEN the Audit_System compares JSON filename to model name, THE Audit_System SHALL report mismatches
2. WHEN the Audit_System compares schema name to repository name, THE Audit_System SHALL report mismatches
3. WHEN the Audit_System compares repository name to service name, THE Audit_System SHALL report mismatches
4. THE Audit_System SHALL check for consistent pluralization (users.json → User model → userRepository → userService)
5. IF naming is ambiguous, THEN THE Audit_System SHALL flag for manual review

### Requirement 8: Layering Structure Validation

**User Story:** As a backend architect, I want to verify correct layering between services, repositories, and data, so that architecture is clean.

#### Acceptance Criteria

1. THE Audit_System SHALL verify services use repositories and not the other way around
2. THE Audit_System SHALL verify no circular references between layers
3. IF DB queries exist in service files, THEN THE Audit_System SHALL flag the misplacement
4. IF data schemas exist in random utils folders, THEN THE Audit_System SHALL flag the misplacement
5. IF JSON data is mixed with code files, THEN THE Audit_System SHALL flag the misplacement

### Requirement 9: Audit Report Generation

**User Story:** As a backend architect, I want a structured audit report, so that I can systematically address issues.

#### Acceptance Criteria

1. THE Audit_System SHALL produce a Markdown report with sections: Inventory, Duplicates_Unused, Structural_Issues, Actionable_Fixes
2. THE Inventory section SHALL contain a table with: JSON_File, Inferred_Table, Schema_File, Repository_File, Service_File, Status
3. THE Duplicates_Unused section SHALL list duplicate JSON files, duplicate services/repos, and unused artifacts
4. THE Structural_Issues section SHALL list layering problems with specific file paths
5. THE Actionable_Fixes section SHALL provide concrete steps to resolve each issue

