const endpoints = {
    user: {
        login:     '/user/login',
        register:  '/user/register',
        logout:    '/user/logout',
        myAccount: '/user/myaccount',
    },
    departamentos: {
        getAll:    '/departamentos',
        getById:   (id: string) => `/departamentos/id/${id}`,
        create:    '/departamentos/create',
        update:    (id: string) => `/departamentos/edit/${id}`,
        delete:    (id: string) => `/departamentos/delete/${id}`,
        exportProdutosPdf: (id: string) => `/departamentos/pdf/${id}/`,
    },
    fornecedores: {
        getAll:    '/fornecedores',
        getById:   (id: string) => `/fornecedores/${id}`,
        create:    '/fornecedores/create',
        update:    (id: string) => `/fornecedores/edit/${id}`,
        delete:    (id: string) => `/fornecedores/delete/${id}`,
        exportProdutosPdf: (id: string) => `/fornecedores/${id}/produtos/export/pdf`,
    },
    produtos: {
        getAll:    '/produtos',
        getById:   (id: string) => `/produtos/${id}`,
        create:    '/produtos/create',
        update:    (id: string) => `/produtos/edit/${id}`,
        delete:    (id: string) => `/produtos/delete/${id}`,
        exportPdf: '/produtos/export/pdf',
    },
    grupos: {
        getAll:    '/grupos',
        getById:   (id: string) => `/grupos/${id}`,
        create:    '/grupos/create',
        update:    (id: string) => `/grupos/edit/${id}`,
        delete:    (id: string) => `/grupos/delete/${id}`,
        exportProdutosPdf: (id: string) => `/grupos/pdf/${id}/`,
    },
    servidores: {
        getAll:   '/user/servidores',
        getById:  (id: string) => `/user/id/${id}`,
        create:   '/user/register-servidor',
        update:   (id: string) => `/funcionarios/edit-servidor/${id}`,
        activate: (id: string) => `/funcionarios/active/${id}`,
        exportPdf: (id: string) => `/funcionarios/pdf/${id}`,
    },
    secretarias: {
        getAll:    '/secretarias',
        getById:   (id: string) => `/secretarias/${id}`,
        create:    '/secretarias/create',
        update:    (id: string) => `/secretarias/edit/${id}`,
        delete:    (id: string) => `/secretarias/delete/${id}`,
        exportProdutosPdf: (id: string) => `/secretarias/${id}/produtos/export/pdf`,
    },
    usuarios: {
        getAll:   '/user',
        getById:  (id: string) => `/user/id/${id}`,
        create:   '/user/register',
        activate: (id: string) => `/funcionarios/active/${id}`,
        edit:     (id: string) => `/funcionarios/edit/${id}`,
        exportPdf: (id: string) => `/funcionarios/pdf/${id}`,
    },
    relatorios: {
        getAll:    '/requisicao',
        getById:   (id: string) => `/requisicao/id/${id}`,
        create:    '/requisicao/create',
        update:    (id: string) => `/requisicao/edit/${id}`,
        delete:    (id: string) => `/requisicao/delete/${id}`,
        exportPdf: (id: string) => `/requisicao/pdf/${id}`,
    }
}

export default endpoints;