const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('sconfigAPI', {
  // Window
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow:    () => ipcRenderer.send('close-window'),

  // File system
  selectFolder:     ()             => ipcRenderer.invoke('select-folder'),
  selectFile:       (filters)      => ipcRenderer.invoke('select-file', filters),
  readFile:         (filePath)     => ipcRenderer.invoke('read-file', filePath),
  writeFile:        (filePath, c)  => ipcRenderer.invoke('write-file', filePath, c),
  listDir:          (dirPath)      => ipcRenderer.invoke('list-dir', dirPath),
  listDirRecursive: (dirPath, max) => ipcRenderer.invoke('list-dir-recursive', dirPath, max),
  readFileBinary:   (filePath)     => ipcRenderer.invoke('read-file-binary', filePath),
  writeFileBinary:  (filePath, b64) => ipcRenderer.invoke('write-file-binary', filePath, b64),
  saveFileDialog:   (defaultName)  => ipcRenderer.invoke('save-file-dialog', defaultName),
  openInExplorer:   (filePath)     => ipcRenderer.invoke('open-in-explorer', filePath),

  // Store
  storeGet: (key)        => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),

  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  startBootstrap: () => ipcRenderer.invoke('start-bootstrap'),
  onBootstrapProgress: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('bootstrap-progress', handler)
    return () => ipcRenderer.removeListener('bootstrap-progress', handler)
  },

  luckPermsRequest: (opts) => ipcRenderer.invoke('luckperms-request', opts),

  bedrockCheckTools: () => ipcRenderer.invoke('bedrock-check-tools'),
  bedrockInstallConverter: (key) => ipcRenderer.invoke('bedrock-install-converter', key),
  bedrockRunExternal: (opts) => ipcRenderer.invoke('bedrock-run-external', opts),
  bedrockOpenGithubIssue: () => ipcRenderer.invoke('bedrock-open-github-issue'),
  onBedrockPipelineLog: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('bedrock-pipeline-log', handler)
    return () => ipcRenderer.removeListener('bedrock-pipeline-log', handler)
  },

  checkAppUpdates: () => ipcRenderer.invoke('check-app-updates'),
  openUpdateWindow: () => ipcRenderer.send('open-update-window'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  minimizeUpdateWindow: () => ipcRenderer.send('minimize-update-window'),
  closeUpdateWindow: () => ipcRenderer.send('close-update-window'),

  mcTextureEnsure: (payload) => ipcRenderer.invoke('mc-texture-ensure', payload),
  mcTextureCacheInfo: () => ipcRenderer.invoke('mc-texture-cache-info'),
  mcTextureClearCache: () => ipcRenderer.invoke('mc-texture-clear-cache'),
})
