// @tenorlab/react-dashboard
// file: src/components/interfaces/index.ts
export * from './core-react.interfaces'

// TODO: should we move this into dashboard-core?
export type TWidgetErrorExtraProps = {
  versionMismatch: boolean
  requiredVer: string
  hostVer: string
  errorMessage: string
  externalDependencies: string[]
}
