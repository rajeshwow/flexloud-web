import { Checkbox, Col, Form, Input, Row, Select, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { toTitleCase } from "../shared/Utils/utils";

const { Title } = Typography;

type MasterOption = {
    id: string;
    label: string;
    value: string;
    parent_id?: string | null;
};

type Props = {
    copyAddress?: boolean;
    onCopyAddressChange?: (checked: boolean) => void;

    countryOptions?: MasterOption[];
    stateOptions?: MasterOption[];
    cityOptions?: MasterOption[];

    countriesLoading?: boolean;
    statesLoading?: boolean;
    citiesLoading?: boolean;
};

export default function AddressSection({
    copyAddress,
    onCopyAddressChange,
    countryOptions = [],
    stateOptions = [],
    cityOptions = [],
    countriesLoading = false,
    statesLoading = false,
    citiesLoading = false,
}: Props) {
    const form = Form.useFormInstance();

    const primaryCountry = Form.useWatch("primary_address_country", form);
    const primaryState = Form.useWatch("primary_address_state", form);

    const alternateCountry = Form.useWatch("alternate_address_country", form);
    const alternateState = Form.useWatch("alternate_address_state", form);

    const countrySelectOptions = useMemo(
        () =>
            countryOptions.map((item) => ({
                label: toTitleCase(item.label),
                value: item.value,
            })),
        [countryOptions]
    );

    const primarySelectedCountry = useMemo(
        () => countryOptions.find((item) => item.value === primaryCountry),
        [countryOptions, primaryCountry]
    );

    const alternateSelectedCountry = useMemo(
        () => countryOptions.find((item) => item.value === alternateCountry),
        [countryOptions, alternateCountry]
    );

    const primaryFilteredStates = useMemo(() => {
        if (!primarySelectedCountry?.id) return [];
        return stateOptions.filter(
            (item) => item.parent_id === primarySelectedCountry.id
        );
    }, [stateOptions, primarySelectedCountry]);

    const alternateFilteredStates = useMemo(() => {
        if (!alternateSelectedCountry?.id) return [];
        return stateOptions.filter(
            (item) => item.parent_id === alternateSelectedCountry.id
        );
    }, [stateOptions, alternateSelectedCountry]);

    const primaryStateSelectOptions = useMemo(
        () =>
            primaryFilteredStates.map((item) => ({
                label: toTitleCase(item.label),
                value: item.value,
            })),
        [primaryFilteredStates]
    );

    const alternateStateSelectOptions = useMemo(
        () =>
            alternateFilteredStates.map((item) => ({
                label: toTitleCase(item.label),
                value: item.value,
            })),
        [alternateFilteredStates]
    );

    const primarySelectedState = useMemo(
        () => primaryFilteredStates.find((item) => item.value === primaryState),
        [primaryFilteredStates, primaryState]
    );

    const alternateSelectedState = useMemo(
        () => alternateFilteredStates.find((item) => item.value === alternateState),
        [alternateFilteredStates, alternateState]
    );

    const primaryFilteredCities = useMemo(() => {
        if (!primarySelectedState?.id) return [];
        return cityOptions.filter((item) => item.parent_id === primarySelectedState.id);
    }, [cityOptions, primarySelectedState]);

    const alternateFilteredCities = useMemo(() => {
        if (!alternateSelectedState?.id) return [];
        return cityOptions.filter((item) => item.parent_id === alternateSelectedState.id);
    }, [cityOptions, alternateSelectedState]);

    const primaryCitySelectOptions = useMemo(
        () =>
            primaryFilteredCities.map((item) => ({
                label: toTitleCase(item.label),
                value: item.value,
            })),
        [primaryFilteredCities]
    );

    const alternateCitySelectOptions = useMemo(
        () =>
            alternateFilteredCities.map((item) => ({
                label: toTitleCase(item.label),
                value: item.value,
            })),
        [alternateFilteredCities]
    );

    const handlePrimaryCountryChange = () => {
        form.setFieldsValue({
            primary_address_state: undefined,
            primary_address_city: undefined,
        });
    };

    const handlePrimaryStateChange = () => {
        form.setFieldsValue({
            primary_address_city: undefined,
        });
    };

    const handleAlternateCountryChange = () => {
        form.setFieldsValue({
            alternate_address_state: undefined,
            alternate_address_city: undefined,
        });
    };

    const handleAlternateStateChange = () => {
        form.setFieldsValue({
            alternate_address_city: undefined,
        });
    };

    useEffect(() => {
        if (!copyAddress) return;

        form.setFieldsValue({
            alternate_address_street: form.getFieldValue("primary_address_street"),
            alternate_address_area: form.getFieldValue("primary_address_area"),
            alternate_address_postal_code: form.getFieldValue("primary_address_postal_code"),
            alternate_address_country: form.getFieldValue("primary_address_country"),
            alternate_address_state: form.getFieldValue("primary_address_state"),
            alternate_address_city: form.getFieldValue("primary_address_city"),
        });
    }, [
        copyAddress,
        form,
        primaryCountry,
        primaryState,
        Form.useWatch("primary_address_city", form),
        Form.useWatch("primary_address_street", form),
        Form.useWatch("primary_address_area", form),
        Form.useWatch("primary_address_postal_code", form),
    ]);

    return (
        <Row gutter={24}>
            <Col xs={24} md={12}>
                <Title level={5}>Primary Address</Title>

                <Form.Item label="Street" name="primary_address_street">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Area" name="primary_address_area">
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Postal Code"
                    name="primary_address_postal_code"
                    rules={[{ len: 6, message: "Postal code must be 6 digits" }]}
                    getValueFromEvent={(e) =>
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                    }
                >
                    <Input
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="Enter 6 digit postal code"
                    />
                </Form.Item>

                <Form.Item label="Country" name="primary_address_country">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select country"
                        loading={countriesLoading}
                        options={countrySelectOptions}
                        optionFilterProp="label"
                        onChange={handlePrimaryCountryChange}
                        notFoundContent="No countries available"
                    />
                </Form.Item>

                <Form.Item label="State" name="primary_address_state">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select state"
                        loading={statesLoading}
                        options={primaryStateSelectOptions}
                        optionFilterProp="label"
                        onChange={handlePrimaryStateChange}
                        disabled={!primaryCountry}
                        notFoundContent="No states available"
                    />
                </Form.Item>

                <Form.Item label="City" name="primary_address_city">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select city"
                        loading={citiesLoading}
                        options={primaryCitySelectOptions}
                        optionFilterProp="label"
                        disabled={!primaryState}
                        notFoundContent="No cities available"
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Title level={5}>Alternate Address</Title>

                    <Checkbox
                        checked={!!copyAddress}
                        onChange={(e) => onCopyAddressChange?.(e.target.checked)}
                    >
                        Copy from Primary
                    </Checkbox>
                </div>

                <Form.Item label="Street" name="alternate_address_street">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Area" name="alternate_address_area">
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Postal Code"
                    name="alternate_address_postal_code"
                    rules={[{ len: 6, message: "Postal code must be 6 digits" }]}
                    getValueFromEvent={(e) =>
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                    }
                >
                    <Input
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="Enter 6 digit postal code"
                    />
                </Form.Item>

                <Form.Item label="Country" name="alternate_address_country">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select country"
                        loading={countriesLoading}
                        options={countrySelectOptions}
                        optionFilterProp="label"
                        onChange={handleAlternateCountryChange}
                        disabled={!!copyAddress}
                        notFoundContent="No countries available"
                    />
                </Form.Item>

                <Form.Item label="State" name="alternate_address_state">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select state"
                        loading={statesLoading}
                        options={alternateStateSelectOptions}
                        optionFilterProp="label"
                        onChange={handleAlternateStateChange}
                        disabled={!!copyAddress || !alternateCountry}
                        notFoundContent="No states available"
                    />
                </Form.Item>

                <Form.Item label="City" name="alternate_address_city">
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select city"
                        loading={citiesLoading}
                        options={alternateCitySelectOptions}
                        optionFilterProp="label"
                        disabled={!!copyAddress || !alternateState}
                        notFoundContent="No cities available"
                    />
                </Form.Item>
            </Col>
        </Row>
    );
}