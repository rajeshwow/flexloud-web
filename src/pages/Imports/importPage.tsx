import {
    CheckCircleOutlined,
    DownloadOutlined,
    FileExcelOutlined,
    InboxOutlined,
    ReloadOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
    Radio,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Upload,
    message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { downloadImportSampleFile, executeImportFile, getImportTemplateMeta, validateImportFile } from "../../redux/reducers/imports.slice";
import type { AppDispatch } from "../../redux/store";

// adjust path if needed

const { Title, Text } = Typography;
const { Dragger } = Upload;

type ImportModule = "contacts" | "leads";
type DuplicateMode = "skip" | "update" | "allow";

type TemplateField = {
    key: string;
    label: string;
    required: boolean;
    type: string;
    enumValues?: string[];
    sampleValue?: string | number | boolean;
};

type TemplateMetaResponse = {
    module: string;
    label: string;
    sampleFileName: string;
    uniqueBy: string[];
    requiredAtLeastOneOf: string[];
    fields: TemplateField[];
};

type RowError = {
    rowNumber: number;
    field?: string;
    message: string;
    rawData?: Record<string, any>;
};

type ValidateResponse = {
    module: string;
    fileName: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    foundHeaders: string[];
    missingHeaders: string[];
    extraHeaders: string[];
    errors: RowError[];
};

type ExecuteResponse = {
    importJobId: string;
    module: string;
    totalRows: number;
    validRows: number;
    importedRows: number;
    skippedRows: number;
    failedRows: number;
    foundHeaders: string[];
    missingHeaders: string[];
    extraHeaders: string[];
    validationErrors: RowError[];
    duplicateErrors: RowError[];
    runtimeErrors: RowError[];
};

const MODULE_OPTIONS = [
    { label: "Contacts", value: "contacts" },
    { label: "Leads", value: "leads" },
];

export default function ImportDataPage() {

    const dispatch = useDispatch<AppDispatch>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [selectedModule, setSelectedModule] = useState<ImportModule>("contacts");
    const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("skip");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [templateMeta, setTemplateMeta] = useState<TemplateMetaResponse | null>(null);
    const [validationResult, setValidationResult] = useState<ValidateResponse | null>(null);
    const [executeResult, setExecuteResult] = useState<ExecuteResponse | null>(null);

    const [loadingTemplate, setLoadingTemplate] = useState(false);
    const [downloadingSample, setDownloadingSample] = useState(false);
    const [validating, setValidating] = useState(false);
    const [importing, setImporting] = useState(false);

    const allErrors = useMemo(() => {
        if (!executeResult) return validationResult?.errors || [];
        return [
            ...(executeResult.validationErrors || []),
            ...(executeResult.duplicateErrors || []),
            ...(executeResult.runtimeErrors || []),
        ];
    }, [validationResult, executeResult]);

    const errorColumns = [
        {
            title: "Row",
            dataIndex: "rowNumber",
            key: "rowNumber",
            width: 90,
            render: (value: number) => <Text strong>{value}</Text>,
        },
        {
            title: "Field",
            dataIndex: "field",
            key: "field",
            width: 180,
            render: (value?: string) => value ? <Tag>{value}</Tag> : "--",
        },
        {
            title: "Message",
            dataIndex: "message",
            key: "message",
            render: (value: string) => <Text>{value}</Text>,
        },
    ];

    const resetResults = () => {
        setValidationResult(null);
        setExecuteResult(null);
    };

    const handleModuleChange = (value: ImportModule) => {
        setSelectedModule(value);
        setTemplateMeta(null);
        setFileList([]);
        resetResults();
        setSelectedFile(null);
    };

    const handleLoadTemplateMeta = async () => {
        try {
            setLoadingTemplate(true);

            const res = await dispatch(getImportTemplateMeta({ module: selectedModule })).unwrap() as any;

            const payload = res?.data;
            setTemplateMeta(payload);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to load template info");
        } finally {
            setLoadingTemplate(false);
        }
    };

    const handleDownloadSample = async () => {
        try {
            setDownloadingSample(true);

            const result = await dispatch(
                downloadImportSampleFile({ module: selectedModule })
            ).unwrap();

            if (!result?.blob) {
                message.error("Sample file data is empty");
                return;
            }

            const url = window.URL.createObjectURL(result.blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = result.fileName || `${selectedModule}_import_sample.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success("Sample file downloaded");
        } catch (error: any) {
            message.error(error?.message || "Failed to download sample file");
        } finally {
            setDownloadingSample(false);
        }
    };

    const handleValidate = async () => {
        if (!selectedFile) {
            message.error("Please select a file first");
            return;
        }

        try {
            setValidating(true);
            setExecuteResult(null);

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("duplicateMode", duplicateMode);

            const res = await dispatch(validateImportFile({ module: selectedModule, file: selectedFile, duplicateMode })).unwrap() as any;

            const payload = res?.data;
            setValidationResult(payload);

            if ((payload?.invalidRows || 0) > 0) {
                message.warning("Validation completed with some errors");
            } else {
                message.success("Validation completed successfully");
            }
        } catch (error: any) {
            setValidationResult(null);
            message.error(error?.response?.data?.message || "Validation failed");
        } finally {
            setValidating(false);
        }
    };

    const handleExecuteImport = async () => {
        if (!selectedFile) {
            message.error("Please select a file first");
            return;
        }

        try {
            setImporting(true);

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("duplicateMode", duplicateMode);

            const res = await dispatch(executeImportFile({ module: selectedModule, file: selectedFile, duplicateMode })).unwrap() as any;

            const payload = res?.data;
            setExecuteResult(payload);
            message.success("Import completed");
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    const canImport =
        !!validationResult &&
        validationResult.totalRows > 0 &&
        validationResult.missingHeaders.length === 0;

    return (
        <div style={{ padding: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card bordered={false}>
                        <Space direction="vertical" size={6} style={{ width: "100%" }}>
                            <Title level={3} style={{ margin: 0 }}>
                                Import Data
                            </Title>
                            <Text type="secondary">
                                Upload CSV or Excel files for contacts, leads, and other modules.
                            </Text>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card
                        bordered={false}
                        title="Import Setup"
                        extra={
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    setTemplateMeta(null);
                                    setFileList([]);
                                    resetResults();
                                    setSelectedFile(null);
                                }}
                            >
                                Reset
                            </Button>
                        }
                    >
                        <Space direction="vertical" size={16} style={{ width: "100%" }}>
                            <div>
                                <Text strong>Module</Text>
                                <Select
                                    value={selectedModule}
                                    onChange={handleModuleChange}
                                    options={MODULE_OPTIONS}
                                    style={{ width: "100%", marginTop: 8 }}
                                />
                            </div>

                            <div>
                                <Space wrap>
                                    <Button
                                        icon={<FileExcelOutlined />}
                                        loading={loadingTemplate}
                                        onClick={handleLoadTemplateMeta}
                                    >
                                        Load Template Info
                                    </Button>

                                    <Button
                                        type="default"
                                        icon={<DownloadOutlined />}
                                        loading={downloadingSample}
                                        onClick={handleDownloadSample}
                                    >
                                        Download Sample
                                    </Button>
                                </Space>
                            </div>

                            <div>
                                <Text strong>Duplicate Mode</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Radio.Group
                                        value={duplicateMode}
                                        onChange={(e) => setDuplicateMode(e.target.value)}
                                    >
                                        <Radio.Button value="skip">Skip Duplicates</Radio.Button>
                                        <Radio.Button value="update">Update Existing</Radio.Button>
                                        <Radio.Button value="allow">Allow Duplicates</Radio.Button>
                                    </Radio.Group>
                                </div>
                            </div>

                            <div>
                                <Text strong>Upload File</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Dragger
                                        multiple={false}
                                        maxCount={1}
                                        accept=".csv,.xlsx,.xls"
                                        fileList={fileList}
                                        beforeUpload={(file) => {
                                            setFileList([file as UploadFile]);
                                            setSelectedFile(file);
                                            resetResults();
                                            return false;
                                        }}
                                        onRemove={() => {
                                            setFileList([]);
                                            setSelectedFile(null);
                                            resetResults();
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined />
                                        </p>
                                        <p className="ant-upload-text">
                                            Click or drag CSV / Excel file to upload
                                        </p>
                                        <p className="ant-upload-hint">
                                            Supported formats: .csv, .xlsx, .xls
                                        </p>
                                    </Dragger>
                                </div>
                            </div>

                            <Space wrap>
                                <Button
                                    type="default"
                                    icon={<CheckCircleOutlined />}
                                    loading={validating}
                                    onClick={handleValidate}
                                    disabled={!selectedFile}
                                >
                                    Validate File
                                </Button>

                                <Button
                                    type="primary"
                                    icon={<UploadOutlined />}
                                    loading={importing}
                                    onClick={handleExecuteImport}
                                    disabled={!selectedFile || !canImport}
                                >
                                    Import Data
                                </Button>
                            </Space>
                        </Space>
                    </Card>

                    {templateMeta && (
                        <Card
                            bordered={false}
                            title="Template Information"
                            style={{ marginTop: 16 }}
                        >
                            <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                <Descriptions column={1} size="small" bordered>
                                    <Descriptions.Item label="Module">
                                        {templateMeta.label}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Sample File">
                                        {templateMeta.sampleFileName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Unique By">
                                        {templateMeta.uniqueBy?.length
                                            ? templateMeta.uniqueBy.map((item) => (
                                                <Tag key={item}>{item}</Tag>
                                            ))
                                            : "--"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Required At Least One Of">
                                        {templateMeta.requiredAtLeastOneOf?.length
                                            ? templateMeta.requiredAtLeastOneOf.map((item) => (
                                                <Tag color="blue" key={item}>
                                                    {item}
                                                </Tag>
                                            ))
                                            : "--"}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider style={{ margin: "8px 0" }} />

                                <Space size={[8, 8]} wrap>
                                    {templateMeta.fields.map((field) => (
                                        <Tag key={field.key} color={field.required ? "red" : "default"}>
                                            {field.label} ({field.type})
                                        </Tag>
                                    ))}
                                </Space>
                            </Space>
                        </Card>
                    )}
                </Col>

                <Col xs={24} lg={14}>
                    {!validationResult && !executeResult ? (
                        <Card bordered={false}>
                            <Empty description="Validate a file to see results here" />
                        </Card>
                    ) : (
                        <Space direction="vertical" size={16} style={{ width: "100%" }}>
                            {validationResult && (
                                <Card bordered={false} title="Validation Summary">
                                    <Descriptions column={2} bordered size="small">
                                        <Descriptions.Item label="Module">
                                            {validationResult.module}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="File">
                                            {validationResult.fileName}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Total Rows">
                                            {validationResult.totalRows}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Valid Rows">
                                            <Tag color="green">{validationResult.validRows}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Invalid Rows">
                                            <Tag color="red">{validationResult.invalidRows}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Duplicate Mode">
                                            {duplicateMode}
                                        </Descriptions.Item>
                                    </Descriptions>

                                    <Divider />

                                    {!!validationResult.missingHeaders.length && (
                                        <Alert
                                            type="error"
                                            showIcon
                                            style={{ marginBottom: 12 }}
                                            message="Missing Required Headers"
                                            description={
                                                <Space wrap>
                                                    {validationResult.missingHeaders.map((item) => (
                                                        <Tag color="red" key={item}>
                                                            {item}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            }
                                        />
                                    )}

                                    {!!validationResult.extraHeaders.length && (
                                        <Alert
                                            type="warning"
                                            showIcon
                                            style={{ marginBottom: 12 }}
                                            message="Extra Headers Found"
                                            description={
                                                <Space wrap>
                                                    {validationResult.extraHeaders.map((item) => (
                                                        <Tag color="orange" key={item}>
                                                            {item}
                                                        </Tag>
                                                    ))}
                                                </Space>
                                            }
                                        />
                                    )}

                                    {!!validationResult.foundHeaders.length && (
                                        <div>
                                            <Text strong>Detected Headers</Text>
                                            <div style={{ marginTop: 8 }}>
                                                <Space wrap>
                                                    {validationResult.foundHeaders.map((item) => (
                                                        <Tag key={item}>{item}</Tag>
                                                    ))}
                                                </Space>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {executeResult && (
                                <Card bordered={false} title="Import Result">
                                    <Descriptions column={2} bordered size="small">
                                        <Descriptions.Item label="Import Job ID">
                                            {executeResult.importJobId}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Module">
                                            {executeResult.module}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Total Rows">
                                            {executeResult.totalRows}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Valid Rows">
                                            <Tag color="green">{executeResult.validRows}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Imported Rows">
                                            <Tag color="green">{executeResult.importedRows}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Skipped Rows">
                                            <Tag color="orange">{executeResult.skippedRows}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Failed Rows">
                                            <Tag color="red">{executeResult.failedRows}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Duplicate Mode">
                                            {duplicateMode}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            )}

                            <Card bordered={false} title="Errors">
                                {allErrors.length ? (
                                    <Table
                                        rowKey={(record, index) =>
                                            `${record.rowNumber}-${record.field || "field"}-${index}`
                                        }
                                        columns={errorColumns}
                                        dataSource={allErrors}
                                        pagination={{ pageSize: 10 }}
                                        scroll={{ x: 700 }}
                                    />
                                ) : (
                                    <Alert
                                        type="success"
                                        showIcon
                                        message="No errors found"
                                        description="Everything looks good for this file."
                                    />
                                )}
                            </Card>
                        </Space>
                    )}
                </Col>
            </Row>
        </div>
    );
}