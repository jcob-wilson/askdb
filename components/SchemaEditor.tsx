'use client';

import { useState, useEffect } from 'react';
import { Edit3, Save, Plus, Trash2, ChevronDown, ChevronRight, Upload, Download, Database, Table } from 'lucide-react';

interface SchemaEditorProps {
  schemaMetadata: any;
  onSchemaUpdate: (schema: any) => void;
  onSchemaSave: (schema: any) => void;
}

export function SchemaEditor({ schemaMetadata, onSchemaUpdate, onSchemaSave }: SchemaEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchema, setEditedSchema] = useState(schemaMetadata);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setEditedSchema(schemaMetadata);
  }, [schemaMetadata]);

  const handleSave = () => {
    onSchemaSave(editedSchema);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSchema(schemaMetadata);
    setIsEditing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target?.result as string);
          setEditedSchema(schema);
          onSchemaUpdate(schema);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(editedSchema, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `schema-${editedSchema.database || 'database'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const addCollection = () => {
    const collectionName = prompt('Enter collection name:');
    if (collectionName && !editedSchema.schema_json[collectionName]) {
      setEditedSchema({
        ...editedSchema,
        schema_json: {
          ...editedSchema.schema_json,
          [collectionName]: {
            _id: "ObjectId",
            name: "string"
          }
        },
        collection_descriptions: {
          ...editedSchema.collection_descriptions,
          [collectionName]: "New collection"
        },
        field_descriptions: {
          ...editedSchema.field_descriptions,
          [collectionName]: {
            _id: "Unique identifier",
            name: "Name field"
          }
        }
      });
    }
  };

  const removeCollection = (collectionName: string) => {
    if (confirm(`Are you sure you want to remove collection "${collectionName}"?`)) {
      const newSchema = { ...editedSchema };
      delete newSchema.schema_json[collectionName];
      delete newSchema.collection_descriptions[collectionName];
      delete newSchema.field_descriptions[collectionName];
      setEditedSchema(newSchema);
    }
  };

  const updateCollectionDescription = (collectionName: string, description: string) => {
    setEditedSchema({
      ...editedSchema,
      collection_descriptions: {
        ...editedSchema.collection_descriptions,
        [collectionName]: description
      }
    });
  };

  const updateFieldDescription = (collectionName: string, fieldName: string, description: string) => {
    setEditedSchema({
      ...editedSchema,
      field_descriptions: {
        ...editedSchema.field_descriptions,
        [collectionName]: {
          ...editedSchema.field_descriptions[collectionName],
          [fieldName]: description
        }
      }
    });
  };

  const addField = (collectionName: string) => {
    const fieldName = prompt('Enter field name:');
    const fieldType = prompt('Enter field type (e.g., string, number, ObjectId, Date):');
    if (fieldName && fieldType) {
      setEditedSchema({
        ...editedSchema,
        schema_json: {
          ...editedSchema.schema_json,
          [collectionName]: {
            ...editedSchema.schema_json[collectionName],
            [fieldName]: fieldType
          }
        },
        field_descriptions: {
          ...editedSchema.field_descriptions,
          [collectionName]: {
            ...editedSchema.field_descriptions[collectionName],
            [fieldName]: `Description for ${fieldName}`
          }
        }
      });
    }
  };

  const removeField = (collectionName: string, fieldName: string) => {
    if (confirm(`Remove field "${fieldName}"?`)) {
      const newSchema = { ...editedSchema };
      delete newSchema.schema_json[collectionName][fieldName];
      delete newSchema.field_descriptions[collectionName][fieldName];
      setEditedSchema(newSchema);
    }
  };

  if (!editedSchema) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">No schema loaded</p>
      </div>
    );
  }

  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div className="border-b border-gray-200 p-8 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
              <Edit3 className="relative h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Schema Editor</h2>
              <p className="text-gray-600 mt-1">Edit your database schema metadata and field descriptions</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary px-6 py-3"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Schema
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="btn-secondary px-6 py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-success px-6 py-3"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="schema-upload"
            />
            <label
              htmlFor="schema-upload"
              className="btn-secondary cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Schema
            </label>
            <button
              onClick={handleDownload}
              className="btn-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Schema
            </button>
          </div>
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            <Database className="h-4 w-4 mr-2" />
            <span className="font-medium">Database: {editedSchema.database}</span>
          </div>
        </div>
      </div>

      {/* Schema Content */}
      <div className="p-8">
        {/* Basic Info */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
              <Database className="relative h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Database Name</label>
              <input
                type="text"
                value={editedSchema.database || ''}
                onChange={(e) => setEditedSchema({...editedSchema, database: e.target.value})}
                disabled={!isEditing}
                className="input disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
              <input
                type="text"
                value={editedSchema.timezone || ''}
                onChange={(e) => setEditedSchema({...editedSchema, timezone: e.target.value})}
                disabled={!isEditing}
                className="input disabled:bg-gray-100"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Domain Notes</label>
            <textarea
              value={editedSchema.domain_notes || ''}
              onChange={(e) => setEditedSchema({...editedSchema, domain_notes: e.target.value})}
              disabled={!isEditing}
              rows={4}
              className="input disabled:bg-gray-100 resize-none"
              placeholder="Business logic notes, e.g., 'Revenue = invoices.amount'"
            />
          </div>
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-primary-100 rounded-xl blur-lg opacity-50"></div>
                <Table className="relative h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Collections</h3>
            </div>
            {isEditing && (
              <button
                onClick={addCollection}
                className="btn-success px-6 py-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Collection
              </button>
            )}
          </div>

          <div className="space-y-6">
            {Object.entries(editedSchema.schema_json || {}).map(([collectionName, fields]: [string, any]) => (
              <div key={collectionName} className="card-hover">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveSection(activeSection === collectionName ? null : collectionName)}
                      className="flex items-center text-left group"
                    >
                      {activeSection === collectionName ? (
                        <ChevronDown className="h-5 w-5 mr-3 text-primary-600 group-hover:text-primary-700" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-3 text-gray-500 group-hover:text-primary-600" />
                      )}
                      <div>
                        <span className="text-lg font-semibold text-gray-800">{collectionName}</span>
                        <p className="text-sm text-gray-600">
                          {Object.keys(fields).length} fields
                        </p>
                      </div>
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => removeCollection(collectionName)}
                        className="text-error-600 hover:text-error-700 p-2 rounded-lg hover:bg-error-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {activeSection === collectionName && (
                  <div className="p-6 space-y-6 animate-slide-down">
                    {/* Collection Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={editedSchema.collection_descriptions?.[collectionName] || ''}
                        onChange={(e) => updateCollectionDescription(collectionName, e.target.value)}
                        disabled={!isEditing}
                        className="input disabled:bg-gray-100"
                        placeholder="Collection description"
                      />
                    </div>

                    {/* Fields */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-gray-700">Fields</label>
                        {isEditing && (
                          <button
                            onClick={() => addField(collectionName)}
                            className="btn-primary px-4 py-2 text-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {Object.entries(fields).map(([fieldName, fieldType]: [string, any]) => (
                          <div key={fieldName} className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Field Name</label>
                              <input
                                type="text"
                                value={fieldName}
                                disabled
                                className="input disabled:bg-gray-200 text-gray-600"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                              <input
                                type="text"
                                value={fieldType}
                                disabled
                                className="input disabled:bg-gray-200 text-gray-600"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                              <input
                                type="text"
                                value={editedSchema.field_descriptions?.[collectionName]?.[fieldName] || ''}
                                onChange={(e) => updateFieldDescription(collectionName, fieldName, e.target.value)}
                                disabled={!isEditing}
                                className="input disabled:bg-gray-100"
                                placeholder="Field description"
                              />
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => removeField(collectionName, fieldName)}
                                className="text-error-600 hover:text-error-700 p-2 rounded-lg hover:bg-error-50 transition-colors mt-6"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
