# Implementation Plan: Service-JSON Audit System

## Overview

This implementation plan breaks down the service-JSON audit system into discrete tasks that analyze the codebase and produce a comprehensive SERVICE_JSON_AUDIT.md report along with a detection script. The audit will be performed by creating TypeScript utilities that can be run to analyze the codebase.

## Current State Analysis

- **Audit Infrastructure**: Not created - `scripts/audit/` directory does not exist
- **SERVICE_JSON_AUDIT.md**: Not created
- **detect-missing-entries.ts**: Not created
- **Testing Framework**: `fast-check` is installed for property-based testing
- **AST Parsing**: `ts-morph` is available for TypeScript analysis
- **JSON Data Files**: 11 files exist in `src/lib/data/`
- **Schema Types**: Partial coverage in `src/lib/schema.ts` (Product, Brand, Category, Company defined; User, Quote, Lead, etc. missing)
- **Repositories**: 4 static + 4 db repositories exist
- **Services**: 17 service files exist

## Tasks

- [ ] 1. Set up audit infrastructure
  - Create `scripts/audit/` directory for audit utilities
  - Create `SERVICE_JSON_AUDIT.md` file with section headers
  - Create `scripts/audit/types.ts` with shared TypeScript interfaces
  - _Requirements: 9.1_

- [ ] 2. Implement JSON Scanner
  - [ ] 2.1 Create JSON file scanner utility
    - Create `scripts/audit/json-scanner.ts`
    - Scan `src/lib/data/` for all JSON files
    - Extract filename, path, record count
    - Extract union of all fields from records
    - Detect field consistency across records
    - _Requirements: 1.1, 2.1_

  - [ ]* 2.2 Write property test for JSON discovery
    - Create `tests/properties/json-discovery.property.test.ts`
    - **Property 1: JSON File Discovery Completeness**
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test for field extraction
    - **Property 4: Field Extraction Completeness**
    - **Validates: Requirements 2.1**

  - [ ]* 2.4 Write property test for field consistency
    - **Property 6: Field Consistency Detection**
    - **Validates: Requirements 2.4**

- [ ] 3. Implement Path Inferrer
  - [ ] 3.1 Create path inference utility
    - Create `scripts/audit/path-inferrer.ts`
    - Implement JSON filename to model name conversion
    - Implement model name to repository path inference
    - Implement model name to service path inference
    - Handle edge cases (hyphenated names, prefixes like "all-")
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 3.2 Write property test for path inference
    - Create `tests/properties/path-inference.property.test.ts`
    - **Property 2: Path Inference Consistency**
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 4. Implement Status Classifier
  - [ ] 4.1 Create status classification utility
    - Create `scripts/audit/status-classifier.ts`
    - Check existence of inferred schema type
    - Check existence of inferred repository file
    - Check existence of inferred service file
    - Return appropriate status (OK, Missing_Schema, Missing_Repo, Missing_Service, Unused_JSON)
    - _Requirements: 1.5_

  - [ ]* 4.2 Write property test for status classification
    - Create `tests/properties/status-classification.property.test.ts`
    - **Property 3: Status Classification Correctness**
    - **Validates: Requirements 1.5**

- [ ] 5. Checkpoint - Review scanner and inferrer
  - Ensure JSON scanning works correctly
  - Ensure path inference follows naming conventions
  - Ask the user if questions arise

- [ ] 6. Implement Field Validator
  - [ ] 6.1 Create schema parser utility
    - Create `scripts/audit/schema-parser.ts`
    - Use ts-morph to parse TypeScript interfaces from src/lib/schema.ts
    - Extract field names and types
    - Identify required vs optional fields
    - _Requirements: 4.1, 4.5_

  - [ ] 6.2 Create field comparison utility
    - Create `scripts/audit/field-validator.ts`
    - Compare JSON fields to schema fields
    - Identify missing required fields
    - Identify extra fields not in schema
    - Detect type mismatches
    - _Requirements: 2.2, 2.3, 4.4_

  - [ ] 6.3 Create required fields checklist generator
    - Add checklist generation to `scripts/audit/field-validator.ts`
    - Generate checklist of required fields per JSON file
    - Calculate coverage percentage for each file
    - Identify files with missing required fields
    - _Requirements: 2.5_

  - [ ]* 6.4 Write property test for field comparison
    - Create `tests/properties/field-comparison.property.test.ts`
    - **Property 5: Field Comparison Correctness**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 6.5 Write property test for schema validation
    - **Property 10: Schema Validation Correctness**
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [ ]* 6.6 Write property test for required fields checklist
    - **Property 17: Required Fields Checklist Generation**
    - **Validates: Requirements 2.5**

- [ ] 7. Implement Import Analyzer
  - [ ] 7.1 Create import extraction utility
    - Create `scripts/audit/import-analyzer.ts`
    - Use ts-morph to parse TypeScript files for import statements
    - Extract JSON file imports
    - Extract repository imports
    - Extract service imports
    - _Requirements: 3.1, 3.2_

  - [ ] 7.2 Create import graph builder
    - Add graph building to `scripts/audit/import-analyzer.ts`
    - Build graph of all import relationships
    - Detect circular imports
    - Identify unused imports
    - _Requirements: 8.2_

  - [ ] 7.3 Create mapping table generator
    - Create `scripts/audit/mapping-generator.ts`
    - Trace data flow: Service → Repository → JSON → Schema
    - Identify complete vs incomplete flows
    - Detect orphaned services and repositories
    - _Requirements: 3.3_

  - [ ]* 7.4 Write property test for import detection
    - Create `tests/properties/import-detection.property.test.ts`
    - **Property 7: Import Detection Accuracy**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 7.5 Write property test for circular import detection
    - **Property 15: Circular Import Detection**
    - **Validates: Requirements 8.2**

  - [ ]* 7.6 Write property test for mapping table
    - **Property 18: Data Flow Mapping Completeness**
    - **Validates: Requirements 3.3**

- [ ] 8. Checkpoint - Review field validator and import analyzer
  - Ensure field validation works correctly
  - Ensure import analysis is accurate
  - Ask the user if questions arise

- [ ] 9. Implement Layering Checker
  - [ ] 9.1 Create layering validation utility
    - Create `scripts/audit/layering-checker.ts`
    - Check services don't directly import JSON files
    - Check repositories don't import services
    - Check no DB queries in service files (Prisma pattern detection)
    - _Requirements: 3.4, 8.1, 8.3_

  - [ ]* 9.2 Write property test for layering violations
    - Create `tests/properties/layering-violations.property.test.ts`
    - **Property 8: Layering Violation Detection**
    - **Validates: Requirements 3.4, 8.1**

  - [ ]* 9.3 Write property test for file placement
    - **Property 16: File Placement Validation**
    - **Validates: Requirements 8.3, 8.4, 8.5**

- [ ] 10. Implement Duplicate Detector
  - [ ] 10.1 Create duplicate detection utility
    - Create `scripts/audit/duplicate-detector.ts`
    - Compare JSON file contents for similarity
    - Detect overlapping data between files
    - Flag files with >90% content overlap
    - _Requirements: 6.1_

  - [ ] 10.2 Create unused artifact detector
    - Add unused detection to `scripts/audit/duplicate-detector.ts`
    - Find JSON files not imported anywhere
    - Find repository functions never called
    - Find services not used by any component
    - _Requirements: 3.5, 6.3, 6.4_

  - [ ] 10.3 Create redundant service detector
    - Compare service files for overlapping function signatures
    - Detect services with >80% similar data access patterns
    - Generate consolidation recommendations
    - _Requirements: 6.2_

  - [ ] 10.4 Create dead code detector
    - Find unreachable functions in services/repositories
    - Detect unused imports related to data flows
    - Identify orphaned data flow code
    - _Requirements: 6.5_

  - [ ]* 10.5 Write property test for duplicate detection
    - Create `tests/properties/duplicate-detection.property.test.ts`
    - **Property 12: Duplicate Content Detection**
    - **Validates: Requirements 6.1**

  - [ ]* 10.6 Write property test for unused detection
    - **Property 9: Unused Repository Detection**
    - **Property 13: Unused JSON Detection**
    - **Validates: Requirements 3.5, 6.3, 6.4**

  - [ ]* 10.7 Write property test for redundant service detection
    - **Property 20: Redundant Service Detection**
    - **Validates: Requirements 6.2**

  - [ ]* 10.8 Write property test for dead code detection
    - **Property 21: Dead Code Detection**
    - **Validates: Requirements 6.5**

- [ ] 11. Implement Naming Validator
  - [ ] 11.1 Create naming consistency checker
    - Create `scripts/audit/naming-validator.ts`
    - Validate JSON filename to model name mapping
    - Validate model name to repository name mapping
    - Validate repository name to service name mapping
    - Check pluralization consistency
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 11.2 Write property test for naming consistency
    - Create `tests/properties/naming-consistency.property.test.ts`
    - **Property 14: Naming Consistency Validation**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [ ] 12. Implement Schema Recommendation Engine
  - [ ] 12.1 Create schema inference utility
    - Create `scripts/audit/schema-recommender.ts`
    - Analyze JSON structure to infer field types
    - Detect nullable fields from null values
    - Generate TypeScript interface code
    - _Requirements: 4.3_

  - [ ] 12.2 Create schema recommendation generator
    - Identify JSON files without corresponding schemas
    - Generate suggested schema path and code
    - Calculate inference confidence score
    - _Requirements: 4.3_

  - [ ]* 12.3 Write property test for schema recommendation
    - Create `tests/properties/schema-recommendation.property.test.ts`
    - **Property 19: Schema Recommendation Accuracy**
    - **Validates: Requirements 4.3**

- [ ] 13. Checkpoint - Review layering, duplicates, naming, and schema recommendations
  - Ensure layering checks work correctly
  - Ensure duplicate and dead code detection is accurate
  - Ensure naming validation follows conventions
  - Ensure schema recommendations are valid TypeScript
  - Ask the user if questions arise

- [ ] 14. Implement Missing Entry Detection Script
  - [ ] 14.1 Create configurable entry detector
    - Create `scripts/detect-missing-entries.ts`
    - Support configurable comparison keys (id, slug, name)
    - Compare expected entries against JSON contents
    - Output missing entry identifiers
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 14.2 Create output formatters
    - Console output format
    - JSON output format
    - _Requirements: 5.5_

  - [ ]* 14.3 Write property test for missing entry detection
    - Create `tests/properties/missing-entry-detection.property.test.ts`
    - **Property 11: Missing Entry Detection**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ] 15. Implement Report Generator
  - [ ] 15.1 Create inventory table generator
    - Create `scripts/audit/report-generator.ts`
    - Generate table with JSON_File, Inferred_Table, Schema_File, Repository_File, Service_File, Status
    - Format as Markdown table
    - _Requirements: 9.2_

  - [ ] 15.2 Create mapping table section generator
    - Generate Service → Repository → JSON → Schema mapping table
    - Highlight incomplete flows and orphaned artifacts
    - _Requirements: 3.3, 9.2_

  - [ ] 15.3 Create required fields checklist section generator
    - List required fields per JSON file
    - Show coverage percentage and missing fields
    - _Requirements: 2.5, 9.2_

  - [ ] 15.4 Create schema recommendations section generator
    - List JSON files without schemas
    - Include generated TypeScript interface suggestions
    - _Requirements: 4.3, 9.2_

  - [ ] 15.5 Create duplicates/unused section generator
    - List duplicate JSON files with paths
    - List duplicate/redundant services
    - List unused artifacts
    - List dead code findings
    - _Requirements: 9.3_

  - [ ] 15.6 Create structural issues section generator
    - List layering problems with file paths
    - List naming inconsistencies
    - List circular imports
    - _Requirements: 9.4_

  - [ ] 15.7 Create actionable fixes section generator
    - Generate concrete fix steps for each issue
    - Prioritize fixes (high/medium/low)
    - Include affected file paths
    - _Requirements: 9.5_

- [ ] 16. Checkpoint - Review report generation
  - Ensure all report sections are generated correctly
  - Ensure fixes are actionable and specific
  - Ask the user if questions arise

- [ ] 17. Run full audit and generate report
  - [ ] 17.1 Execute audit on current codebase
    - Create `scripts/audit/run-audit.ts` as main entry point
    - Run JSON scanner on src/lib/data/
    - Run path inferrer on all JSON files
    - Run field validator on all JSON/schema pairs
    - Run required fields checklist generator
    - Run import analyzer on all TypeScript files
    - Run mapping table generator
    - Run layering checker
    - Run duplicate and dead code detector
    - Run naming validator
    - Run schema recommendation engine
    - _Requirements: 1.1-9.5_

  - [ ] 17.2 Generate SERVICE_JSON_AUDIT.md
    - Write inventory section
    - Write mapping table section
    - Write required fields checklist section
    - Write schema recommendations section
    - Write duplicates/unused section
    - Write structural issues section
    - Write actionable fixes section
    - _Requirements: 9.1_

  - [ ] 17.3 Verify detect-missing-entries.ts script works
    - Test script with sample expected entries
    - Verify console and JSON output formats
    - Add usage documentation in script header
    - _Requirements: 5.1_

- [ ] 18. Final checkpoint - Complete audit
  - Ensure SERVICE_JSON_AUDIT.md is complete and actionable
  - Ensure detect-missing-entries.ts script works
  - Ask the user to review the final report

## Notes

- Tasks marked with `*` are optional property tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- The audit produces SERVICE_JSON_AUDIT.md and scripts/detect-missing-entries.ts as outputs
- Property tests use fast-check library (already installed)
- TypeScript AST parsing uses ts-morph library (already installed)
- All audit utilities will be in `scripts/audit/` directory

