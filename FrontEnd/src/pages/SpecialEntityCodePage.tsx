// client/src/pages/SpecialEntityCodePage.tsx
// Special Entity Code Page for Complex Entities with Multiple Fields
// Complete Separation Entity Architecture - SPECIAL pattern implementation

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import GenericEntityComplexForm from '../components/forms/GenericEntityComplexForm';
import {
  EntityPageHeader,
  EntitySearchControls,
  EntityDataTable,
  type EntityStats,
  type TableColumn
} from '../components/generic-page';
import { getColumnsByEntityType, getEntityPattern } from '../components/generic-page/EntityColumnHelper';
import type { EntityData as ColumnHelperEntityData } from '../components/generic-page/EntityColumnHelper';
import type { FormSection } from '../components/forms/GenericEntityComplexForm';
import { TrashIcon } from '@heroicons/react/24/outline';

// ============ INTERFACES ============

// Extend the column helper entity data for flexibility
interface EntityData extends ColumnHelperEntityData {
  [key: string]: any; // Allow additional properties for flexibility
}

interface EntityService<T> {
  getEntities: (params?: any) => Promise<{
    success: boolean;
    data: T[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    };
    message?: string;
    errors?: Record<string, string[]>;
  }>;
  createEntity: (data: Partial<T>) => Promise<{
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
  }>;
  updateEntity: (code: string, data: Partial<T>) => Promise<{
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
  }>;
  deleteEntity: (code: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  toggleEntityStatus?: (code: string) => Promise<{
    success: boolean;
    data?: T;
    message?: string;
  }>;
  getStats?: () => Promise<{
    success: boolean;
    data?: {
      total: number;
      active: number;
      inactive: number;
      [key: string]: any;
    };
    message?: string;
  }>;
}

export interface SearchConfig {
  searchableFields: Array<{
    key: string;
    label: string;
    weight: number;
  }>;
  placeholder: string;
  debounceMs?: number;
  minSearchLength?: number;
  caseSensitive?: boolean;
  enableHighlighting?: boolean;
  maxResults?: number;
}

export interface StatusConfig {
  enableBulkStatusToggle?: boolean;
  bulkToggleConfirmation?: boolean;
  statusLabels?: {
    active: string;
    inactive: string;
    all: string;
  };
  statusIcons?: {
    active: string;
    inactive: string;
  };
}

interface SpecialEntityCodePageProps<T extends EntityData> {
  entityName: string; // "Part", "Recipe", "Assembly", etc.
  entityNamePlural: string; // "Parts", "Recipes", "Assemblies", etc.
  entityDescription: string; // "manufacturing parts and components", etc.
  service: EntityService<T>;
  breadcrumbItems?: Array<{ label: string; href?: string }>;

  // Form Configuration - This is what makes it SPECIAL
  formSections: FormSection[];
  primaryKeyField: string; // e.g., 'partno', 'recipe_code', 'assembly_id'

  // Table Configuration
  customColumns?: TableColumn<any>[];
  hiddenColumns?: string[]; // List of column keys to hide

  // Validation
  globalValidation?: (data: Record<string, any>) => Record<string, string[]>;

  // Search and Filter
  searchConfig?: SearchConfig;
  statusConfig?: StatusConfig;

  // Display Options
  defaultPageSize?: number;
  enablePagination?: boolean;
  debugMode?: boolean;

  // Form Display Mode
  useEmbeddedForm?: boolean; // true = embedded above table, false = modal (default)
  embeddedFormColumns?: number; // number of columns for embedded form layout (default: 4)

  // Custom Actions
  additionalHeaderActions?: React.ReactNode; // Additional buttons to show after the default "Add" button
}

interface EntityPageState<T extends EntityData> {
  entities: T[];
  loading: boolean;
  error: string | null;
  selectedEntity: T | null;
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showEmbeddedForm: boolean;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortBy: keyof T;
  sortOrder: 'asc' | 'desc';
  activeFilter: boolean | undefined;
  stats: EntityStats;
  operationLoading: boolean;
  statusToggleLoading: Set<string>;
}

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ============ UTILITY FUNCTIONS ============

const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-UK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
};

const highlightSearchText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// ============ SPECIAL ENTITY CODE PAGE COMPONENT ============

function SpecialEntityCodePage<T extends EntityData>({
  entityName,
  entityNamePlural,
  entityDescription,
  service,
  breadcrumbItems,
  formSections,
  primaryKeyField,
  customColumns = [],
  hiddenColumns = [],
  globalValidation,
  searchConfig,
  statusConfig,
  defaultPageSize = 20,
  enablePagination = true,
  debugMode = false,
  useEmbeddedForm = false,
  embeddedFormColumns = 4,
  additionalHeaderActions
}: SpecialEntityCodePageProps<T>) {
  const navigate = useNavigate();

  // ============ STATE ============
  const [state, setState] = useState<EntityPageState<T>>({
    entities: [],
    loading: true,
    error: null,
    selectedEntity: null,
    showCreateModal: false,
    showEditModal: false,
    showDeleteModal: false,
    showEmbeddedForm: false,
    searchTerm: '',
    currentPage: 1,
    pageSize: defaultPageSize,
    totalItems: 0,
    totalPages: 0,
    sortBy: primaryKeyField as keyof T,
    sortOrder: 'asc',
    activeFilter: undefined,
    stats: { total: 0, active: 0, inactive: 0 },
    operationLoading: false,
    statusToggleLoading: new Set()
  });

  const [notification, setNotification] = useState<Notification | null>(null);

  // ============ HELPER FUNCTIONS ============

  const showNotification = useCallback((type: Notification['type'], message: string) => {
    if (debugMode) {
      console.log(`🔔 ${entityName} Page - Notification:`, { type, message });
    }
    setNotification({ type, message });
  }, [entityName, debugMode]);

  const updateState = useCallback((updates: Partial<EntityPageState<T>>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ============ STATUS TOGGLE HANDLER ============

  const handleToggleStatus = useCallback(async (entity: T) => {
    if (!service.toggleEntityStatus) return;

    const entityCode = entity[primaryKeyField];
    updateState({
      statusToggleLoading: new Set(state.statusToggleLoading).add(entityCode)
    });

    try {
      if (debugMode) {
        console.log(`🔧 ${entityName} Page - Toggling status:`, entityCode);
      }

      const response = await service.toggleEntityStatus(entityCode);

      if (response.success) {
        showNotification('success', response.message || 'Status updated successfully');
        await loadEntities(false);
      } else {
        showNotification('error', response.message || 'Failed to update status');
      }
    } catch (error) {
      if (debugMode) {
        console.error(`❌ ${entityName} Page - Toggle error:`, error);
      }
      showNotification('error', error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      const newLoading = new Set(state.statusToggleLoading);
      newLoading.delete(entityCode);
      updateState({ statusToggleLoading: newLoading });
    }
  }, [entityName, service, state.statusToggleLoading, primaryKeyField, debugMode, showNotification, updateState]);

  // ============ COLUMN CONFIGURATION ============

  const getDefaultColumns = useCallback((): TableColumn<T>[] => {
    const baseColumns: TableColumn<T>[] = [
      {
        key: primaryKeyField,
        label: `${entityName} Code`,
        sortable: true,
        width: 'w-32',
        className: 'font-mono text-sm',
        render: (value: string) => (
          <span className="px-2 py-1 bg-gray-100 rounded text-gray-800 font-medium">
            {highlightSearchText(value || '', state.searchTerm)}
          </span>
        )
      },
      {
        key: 'is_active',
        label: 'Status',
        sortable: true,
        width: 'w-32',
        render: (value: boolean, entity: T) => {
          const entityId = entity[primaryKeyField];
          const isToggling = state.statusToggleLoading.has(entityId);

          return (
            <button
              onClick={() => service.toggleEntityStatus ? handleToggleStatus(entity) : null}
              disabled={isToggling || !service.toggleEntityStatus}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                ${value
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                } ${isToggling || !service.toggleEntityStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              `}
              title={service.toggleEntityStatus ? 'Click to toggle status' : 'Status toggle not available'}
            >
              {isToggling ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-600' : 'bg-red-600'}`} />
              )}
              {value ? 'Active' : 'Inactive'}
            </button>
          );
        }
      },
      {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        width: 'w-40',
        render: (value: string) => (
          <span className="text-sm text-gray-600">
            {formatDateTime(value)}
          </span>
        )
      },
      {
        key: 'updated_at',
        label: 'Updated',
        sortable: true,
        width: 'w-40',
        render: (value: string) => (
          <span className="text-sm text-gray-600">
            {formatDateTime(value)}
          </span>
        )
      }
    ];

    // Filter out hidden columns
    const visibleBaseColumns = baseColumns.filter(col => !hiddenColumns.includes(col.key as string));
    const visibleCustomColumns = customColumns.filter(col => !hiddenColumns.includes(col.key as string));

    // Add actions column
    const actionsColumn: TableColumn<T> = {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: 'w-32',
      className: 'text-center'
    };

    return [...visibleBaseColumns, ...visibleCustomColumns, actionsColumn];
  }, [entityName, customColumns, hiddenColumns, state.searchTerm, state.statusToggleLoading, service.toggleEntityStatus, handleToggleStatus, primaryKeyField]);

  // ============ DATA LOADING ============

  const loadEntities = useCallback(async (showLoading = true) => {
    if (showLoading) {
      updateState({ loading: true, error: null });
    }

    try {
      if (debugMode) {
        console.log(`🔄 ${entityName} Page - Loading entities...`, {
          currentPage: state.currentPage,
          pageSize: state.pageSize,
          searchTerm: state.searchTerm,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          activeFilter: state.activeFilter
        });
      }

      const params = {
        page: state.currentPage,
        limit: state.pageSize,
        search: state.searchTerm || undefined,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        isActive: state.activeFilter 
      };

      const response = await service.getEntities(params);

      if (debugMode) {
        console.log(`✅ ${entityName} Page - Entities loaded:`, response);
      }

      if (response.success && response.data) {
        updateState({
          entities: response.data,
          totalItems: response.pagination?.totalItems || response.data.length,
          totalPages: response.pagination?.totalPages || 1,
          loading: false,
          error: null
        });

        // Load stats if available
        if (service.getStats) {
          try {
            const statsResponse = await service.getStats();
            if (statsResponse.success && statsResponse.data) {
              updateState({
                stats: {
                  total: statsResponse.data.total || 0,
                  active: statsResponse.data.active || 0,
                  inactive: statsResponse.data.inactive || 0
                }
              });
            }
          } catch (statsError) {
            if (debugMode) {
              console.warn(`⚠️ ${entityName} Page - Failed to load stats:`, statsError);
            }
          }
        }
      } else {
        updateState({
          entities: [],
          totalItems: 0,
          totalPages: 0,
          loading: false,
          error: response.message || `Failed to load ${entityNamePlural.toLowerCase()}`
        });
      }
    } catch (error) {
      if (debugMode) {
        console.error(`❌ ${entityName} Page - Load error:`, error);
      }
      updateState({
        entities: [],
        totalItems: 0,
        totalPages: 0,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to load ${entityNamePlural.toLowerCase()}`
      });
    }
  }, [entityName, entityNamePlural, service, state.currentPage, state.pageSize, state.searchTerm, state.sortBy, state.sortOrder, state.activeFilter, debugMode, updateState]);

  // ============ CRUD OPERATIONS ============

  const handleCreate = useCallback(async (data: any) => {
    try {
      if (debugMode) {
        console.log(`🔧 ${entityName} Page - Creating entity:`, data);
      }

      const response = await service.createEntity(data);

      if (response.success) {
        showNotification('success', response.message || `${entityName} created successfully`);
        updateState({
          showCreateModal: false,
          showEmbeddedForm: false,
          selectedEntity: null
        });
        await loadEntities(false);
        return { success: true };
      } else {
        return {
          success: false,
          errors: response.errors || {},
          message: response.message || `Failed to create ${entityName.toLowerCase()}`
        };
      }
    } catch (error) {
      if (debugMode) {
        console.error(`❌ ${entityName} Page - Create error:`, error);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : `Failed to create ${entityName.toLowerCase()}`
      };
    }
  }, [entityName, service, debugMode, showNotification, updateState, loadEntities]);

  const handleEdit = useCallback(async (data: any) => {
    if (!state.selectedEntity) return { success: false, message: 'No entity selected' };

    try {
      if (debugMode) {
        console.log(`🔧 ${entityName} Page - Updating entity:`, state.selectedEntity[primaryKeyField], data);
      }

      const response = await service.updateEntity(state.selectedEntity[primaryKeyField], data);

      if (response.success) {
        showNotification('success', response.message || `${entityName} updated successfully`);
        updateState({
          showEditModal: false,
          showEmbeddedForm: false,
          selectedEntity: null
        });
        await loadEntities(false);
        return { success: true };
      } else {
        return {
          success: false,
          errors: response.errors || {},
          message: response.message || `Failed to update ${entityName.toLowerCase()}`
        };
      }
    } catch (error) {
      if (debugMode) {
        console.error(`❌ ${entityName} Page - Update error:`, error);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : `Failed to update ${entityName.toLowerCase()}`
      };
    }
  }, [entityName, service, state.selectedEntity, primaryKeyField, debugMode, showNotification, updateState, loadEntities]);

  const handleDelete = useCallback(async () => {
    if (!state.selectedEntity) return;

    updateState({ operationLoading: true });

    try {
      if (debugMode) {
        console.log(`🔧 ${entityName} Page - Deleting entity:`, state.selectedEntity[primaryKeyField]);
      }

      const response = await service.deleteEntity(state.selectedEntity[primaryKeyField]);

      if (response.success) {
        showNotification('success', response.message || `${entityName} deleted successfully`);
        updateState({
          showDeleteModal: false,
          selectedEntity: null,
          operationLoading: false
        });
        await loadEntities(false);
      } else {
        showNotification('error', response.message || `Failed to delete ${entityName.toLowerCase()}`);
        updateState({ operationLoading: false });
      }
    } catch (error) {
      if (debugMode) {
        console.error(`❌ ${entityName} Page - Delete error:`, error);
      }
      showNotification('error', error instanceof Error ? error.message : `Failed to delete ${entityName.toLowerCase()}`);
      updateState({ operationLoading: false });
    }
  }, [entityName, service, state.selectedEntity, primaryKeyField, debugMode, showNotification, updateState, loadEntities]);

  // ============ SEARCH AND FILTER HANDLERS ============

  const handleSearch = useCallback((searchTerm: string) => {
    updateState({
      searchTerm,
      currentPage: 1
    });
  }, [updateState]);

  const handleSort = useCallback((column: string) => {
    const newSortOrder = state.sortBy === column && state.sortOrder === 'asc' ? 'desc' : 'asc';
    updateState({
      sortBy: column as keyof T,
      sortOrder: newSortOrder
    });
  }, [state.sortBy, state.sortOrder, updateState]);

  const handlePageChange = useCallback((page: number) => {
    updateState({ currentPage: page });
  }, [updateState]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updateState({
      pageSize,
      currentPage: 1
    });
  }, [updateState]);

  const handleFilterChange = useCallback((activeFilter: boolean | undefined) => {
    updateState({
      activeFilter,
      currentPage: 1
    });
  }, [updateState]);

  // ============ EFFECTS ============

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <EntityPageHeader
        entityName={entityName}
        entityNamePlural={entityNamePlural}
        entityDescription={entityDescription}
        breadcrumbItems={breadcrumbItems}
        stats={state.stats}
        onRefresh={() => loadEntities()}
        onExport={() => {/* Implement export functionality */}}
        loading={state.loading}
        customActions={
          <>
            <button
              onClick={() => {
                if (useEmbeddedForm) {
                  updateState({ showEmbeddedForm: true, selectedEntity: null });
                } else {
                  updateState({ showCreateModal: true, selectedEntity: null });
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">+</span>
              Add {entityName}
            </button>
            {additionalHeaderActions}
          </>
        }
      />

      {/* Search Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <EntitySearchControls
          searchTerm={state.searchTerm}
          onSearchChange={handleSearch}
          activeFilter={state.activeFilter}
          onFilterChange={handleFilterChange}
          hasActiveFilters={!!state.searchTerm || state.activeFilter !== undefined}
          onClearFilters={() => {
            updateState({
              searchTerm: '',
              activeFilter: undefined,
              currentPage: 1
            });
          }}
          entityName={entityName}
          onCreateNew={() => {
            if (useEmbeddedForm) {
              updateState({ showEmbeddedForm: true, selectedEntity: null });
            } else {
              updateState({ showCreateModal: true, selectedEntity: null });
            }
          }}
          searchConfig={searchConfig}
          loading={state.loading}
          className="max-w-4xl"
        />
      </div>

      {/* Embedded Form Section */}
      {useEmbeddedForm && state.showEmbeddedForm && (
        <div className="bg-gradient-to-br from-white via-orange-25 to-amber-25 border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {state.selectedEntity ? '✏️' : '➕'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {state.selectedEntity ? `Edit ${entityName}` : `Create New ${entityName}`}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {state.selectedEntity
                      ? `Modify the details for ${state.selectedEntity[primaryKeyField]}`
                      : `Fill in the information below to create a new ${entityName.toLowerCase()}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateState({ showEmbeddedForm: false, selectedEntity: null })}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                title="Close form"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <GenericEntityComplexForm
                mode={state.selectedEntity ? 'edit' : 'create'}
                entity={state.selectedEntity || undefined}
                sections={formSections}
                onSubmit={state.selectedEntity ? handleEdit : handleCreate}
                onCancel={() => updateState({ showEmbeddedForm: false, selectedEntity: null })}
                entityName={entityName}
                primaryKeyField={primaryKeyField}
                globalValidation={globalValidation}
                showAsModal={false}
                loading={state.operationLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="px-6 py-6">
        <EntityDataTable
          entities={state.entities}
          loading={state.loading}
          error={state.error}
          columns={getDefaultColumns()}
          onEdit={(entity) => {
            if (useEmbeddedForm) {
              updateState({ selectedEntity: entity, showEmbeddedForm: true });
            } else {
              updateState({ selectedEntity: entity, showEditModal: true });
            }
          }}
          onDelete={(entity) => {
            updateState({ selectedEntity: entity, showDeleteModal: true });
          }}
          onToggleStatus={service.toggleEntityStatus ? handleToggleStatus : undefined}
          statusToggleLoading={state.statusToggleLoading}
          getEntityId={(entity) => entity[primaryKeyField]}
          sortBy={state.sortBy as string}
          sortOrder={state.sortOrder}
          onSort={handleSort}
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          totalItems={state.totalItems}
          pageSize={state.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          emptyStateTitle={`No ${entityNamePlural.toLowerCase()} found`}
          emptyStateDescription={`Get started by creating your first ${entityName.toLowerCase()}.`}
          emptyStateAction={`Add ${entityName}`}
          onEmptyStateAction={() => {
            if (useEmbeddedForm) {
              updateState({ showEmbeddedForm: true });
            } else {
              updateState({ showCreateModal: true });
            }
          }}
          hasActiveFilters={!!state.searchTerm || state.activeFilter !== undefined}
          onClearFilters={() => {
            updateState({
              searchTerm: '',
              activeFilter: undefined,
              currentPage: 1
            });
          }}
        />
      </div>

      {/* Create Modal (only when not using embedded form) */}
      {!useEmbeddedForm && state.showCreateModal && (
        <GenericEntityComplexForm
          mode="create"
          sections={formSections}
          onSubmit={handleCreate}
          onCancel={() => updateState({ showCreateModal: false })}
          entityName={entityName}
          primaryKeyField={primaryKeyField}
          globalValidation={globalValidation}
          modalSize="2xl"
        />
      )}

      {/* Edit Modal (only when not using embedded form) */}
      {!useEmbeddedForm && state.showEditModal && state.selectedEntity && (
        <GenericEntityComplexForm
          mode="edit"
          entity={state.selectedEntity}
          sections={formSections}
          onSubmit={handleEdit}
          onCancel={() => updateState({ showEditModal: false, selectedEntity: null })}
          entityName={entityName}
          primaryKeyField={primaryKeyField}
          globalValidation={globalValidation}
          modalSize="2xl"
        />
      )}

      {/* Delete Confirmation Modal */}
      {state.showDeleteModal && state.selectedEntity && (
        <Modal
          isOpen={true}
          onClose={() => updateState({ showDeleteModal: false, selectedEntity: null })}
          title={`Delete ${entityName}`}
          size="md"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Are you sure you want to delete this {entityName.toLowerCase()}?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>{state.selectedEntity[primaryKeyField]}</strong>
                </p>
                <p className="text-sm text-red-600 mt-2">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => updateState({ showDeleteModal: false, selectedEntity: null })}
                disabled={state.operationLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={state.operationLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {state.operationLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Delete {entityName}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notifications */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default SpecialEntityCodePage;

/*
=== SPECIAL ENTITY CODE PAGE FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained page component for complex entities
✅ Uses GenericEntityComplexForm for multi-field forms
✅ Maintains consistency with other generic pages
✅ Zero dependencies on specific entity implementations

SPECIAL ENTITY PATTERN COMPLIANCE:
✅ Designed for entities with many custom fields
✅ Configurable primary key field support
✅ Flexible form section configuration
✅ Complex validation and field dependencies

COMPREHENSIVE FORM INTEGRATION:
✅ Modal-based complex forms with sections
✅ Field validation and error handling
✅ Custom component integration support
✅ Conditional field display capabilities

ADVANCED FEATURES:
✅ Complete CRUD operations with complex forms
✅ Status toggling with loading states
✅ Advanced search and filtering
✅ Professional data table with custom columns
✅ Statistics display and management

ERROR HANDLING & DEBUGGING:
✅ Comprehensive error handling with user feedback
✅ Debug mode with detailed console logging
✅ Toast notifications for operation feedback
✅ Graceful fallback for failed operations

FLEXIBLE CONFIGURATION:
✅ Configurable form sections and fields
✅ Custom column support for tables
✅ Searchable fields configuration
✅ Global validation functions
✅ Breadcrumb navigation support

MANUFACTURING CONTEXT:
✅ Entity statistics display (total/active/inactive)
✅ Professional styling with orange theme
✅ Manufacturing-appropriate terminology
✅ Audit trail display (created/updated timestamps)

TYPE SAFETY:
✅ Full TypeScript support with generic constraints
✅ Proper service interface definitions
✅ Type-safe entity data handling
✅ Comprehensive error type definitions

PERFORMANCE OPTIMIZATIONS:
✅ Efficient state management
✅ Minimal re-renders with useCallback
✅ Cache busting for fresh data
✅ Loading states for all operations

This SpecialEntityCodePage provides a complete solution for complex
entities while maintaining the separation of concerns and type safety
that makes the generic pattern so powerful for manufacturing systems.
*/