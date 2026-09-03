# ins-input-tel



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute              | Description | Type      | Default     |
| --------------------- | ---------------------- | ----------- | --------- | ----------- |
| `areaCode`            | `area-code`            |             | `string`  | `""`        |
| `areacodePlaceholder` | `areacode-placeholder` |             | `string`  | `""`        |
| `areacodeValue`       | `areacode-value`       |             | `string`  | `""`        |
| `checkLoad`           | `check-load`           |             | `boolean` | `false`     |
| `checkValue`          | `check-value`          |             | `boolean` | `false`     |
| `countryCode`         | `country-code`         |             | `string`  | `"61"`      |
| `description`         | `description`          |             | `string`  | `""`        |
| `disabled`            | `disabled`             |             | `boolean` | `undefined` |
| `errorMessage`        | `error-message`        |             | `string`  | `""`        |
| `hasError`            | `has-error`            |             | `boolean` | `undefined` |
| `hasLoad`             | `has-load`             |             | `string`  | `undefined` |
| `htmlDescription`     | `html-description`     |             | `boolean` | `false`     |
| `label`               | `label`                |             | `string`  | `""`        |
| `load`                | `load`                 |             | `boolean` | `false`     |
| `noAreacode`          | `no-areacode`          |             | `boolean` | `undefined` |
| `phoneNumber`         | `phone-number`         |             | `string`  | `""`        |
| `phonenumPlaceholder` | `phonenum-placeholder` |             | `string`  | `""`        |
| `phonenumValue`       | `phonenum-value`       |             | `string`  | `""`        |
| `readonly`            | `readonly`             |             | `boolean` | `undefined` |
| `required`            | `required`             |             | `boolean` | `undefined` |
| `tooltip`             | `tooltip`              |             | `string`  | `""`        |


## Events

| Event            | Description | Type               |
| ---------------- | ----------- | ------------------ |
| `didLoad`        |             | `CustomEvent<any>` |
| `insInput`       |             | `CustomEvent<any>` |
| `insValueChange` |             | `CustomEvent<any>` |


## Methods

### `getCountryData() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getValue() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `getValues() => Promise<{ country_code: string; area_code: string; phone_number: string; }>`



#### Returns

Type: `Promise<{ country_code: string; area_code: string; phone_number: string; }>`



### `insRecover() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `insReset() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setCountry(country: string) => Promise<void>`



#### Parameters

| Name      | Type     | Description |
| --------- | -------- | ----------- |
| `country` | `string` |             |

#### Returns

Type: `Promise<void>`



### `setCountryCode(code: string) => Promise<void>`



#### Parameters

| Name   | Type     | Description |
| ------ | -------- | ----------- |
| `code` | `string` |             |

#### Returns

Type: `Promise<void>`



### `setValue({ country, country_code, area_code, phone_number }: { country?: string; country_code?: string; area_code?: string; phone_number?: string; }) => Promise<void>`



#### Parameters

| Name  | Type                                                                                      | Description |
| ----- | ----------------------------------------------------------------------------------------- | ----------- |
| `__0` | `{ country?: string; country_code?: string; area_code?: string; phone_number?: string; }` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)

### Graph
```mermaid
graph TD;
  ins-input-tel --> ins-input-tooltip
  style ins-input-tel fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
