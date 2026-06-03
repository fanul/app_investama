// Router.js

const Router = {
  route: function(action, token, payload) {
    if (!action) {
      throw new Error('ACTION_REQUIRED');
    }
    
    const publicActions = ['auth.login', 'auth.register', 'auth.forgotPassword'];
    if (publicActions.includes(action)) {
      return this.executePublic(action, payload);
    }
    
    const userId = validateToken(token);
    const user = getUserById(userId);
    if (!user) {
      throw new Error('INVALID_TOKEN');
    }
    
    if (user.status !== 'active') {
      throw new Error('ACCOUNT_INACTIVE');
    }
    
    const adminOnlyActions = [
      'admin.users.list',
      'admin.users.updateStatus',
      'admin.users.resetPassword',
      'admin.config.get',
      'admin.config.set',
      'admin.logs.list',
      'admin.backup',
      'instrument.add',
      'instrument.edit',
      'price.manualUpdate'
    ];
    
    const isAdminAction = adminOnlyActions.includes(action) || action.startsWith('admin.');
    const userRole = user.role;
    
    if (isAdminAction) {
      if (!['admin', 'superadmin'].includes(userRole)) {
        AuditService.log(userId, 'unauthorized_attempt', action, { role: userRole });
        throw new Error('UNAUTHORIZED_ACCESS: Aksi ini hanya dapat diakses oleh Admin.');
      }
    }
    
    return this.executeProtected(action, userId, token, payload);
  },

  executePublic: function(action, payload) {
    const data = payload || {};
    switch(action) {
      case 'auth.register':
        return register(data);
      case 'auth.login':
        return login(data);
      case 'auth.forgotPassword':
        return forgotPassword(data);
      default:
        throw new Error(`ACTION_NOT_FOUND: Rute publik "${action}" tidak ditemukan`);
    }
  },

  executeProtected: function(action, userId, token, payload) {
    const data = payload || {};
    switch(action) {
      case 'auth.logout':
        return logout(token);
      case 'auth.me':
        return getActiveUser(token);
      case 'auth.changePassword':
        return changePassword(token, data);
        
      case 'tx.list':
        return { status: 'success', data: listTransactions(userId) };
      case 'tx.get':
        return { status: 'success', data: getTransaction(userId, data.tx_id) };
      case 'tx.add':
        return addTransaction(userId, data);
      case 'tx.edit':
        return editTransaction(userId, data);
      case 'tx.delete':
        return deleteTransaction(userId, data);
      case 'tx.summary':
        return getSummary(userId);
        
      case 'instrument.list':
        return { status: 'success', data: listInstruments() };
      case 'instrument.search':
        return searchInstruments(data);
      case 'instrument.add':
        return addInstrument(data);
      case 'instrument.edit':
        return editInstrument(data);
        
      case 'price.getAll':
        return getAllPrices();
      case 'price.refresh':
        return refreshPrice(data);
      case 'price.manualUpdate':
        return manualUpdatePrice(data);
      case 'news.get':
        return getNewsForTicker();
      case 'admin.news.list':
        return listAllNews();
      case 'admin.news.toggle':
        return toggleNewsActive(data);
      case 'admin.news.sync':
        return syncNewsFromRSS();
        
      case 'export.csv':
        return exportCSV(userId, data);
        
      case 'admin.users.list':
        return listUsers();
      case 'admin.users.updateStatus':
        return updateUserStatus(data);
      case 'admin.users.resetPassword':
        return resetUserPassword(data);
      case 'admin.config.get':
        return { status: 'success', data: listSystemConfigs() };
      case 'admin.config.set':
        return updateSystemConfig(userId, data);
      case 'admin.logs.list':
        return listAuditLogs(data);
      case 'admin.backup':
        return { status: 'success', data: { backup_url: backupSpreadsheet() } };
        
      default:
        throw new Error(`ACTION_NOT_FOUND: Rute terproteksi "${action}" tidak ditemukan`);
    }
  }
};
