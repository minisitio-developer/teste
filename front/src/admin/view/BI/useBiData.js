import { useState, useEffect, useCallback } from 'react';
import { masterPath } from '../../../config/config';

export default function useBiData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const token = sessionStorage.getItem('userTokenAccess');
    fetch(`${masterPath.url}/admin/dashboard`, {
      headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
          if (!res.data.lastUpdated && !sessionStorage.getItem('dashboardRefreshed')) {
            sessionStorage.setItem('dashboardRefreshed', '1');
            refresh();
          }
        } else setError('Erro ao carregar dados');
        setLoading(false);
      })
      .catch(() => { setError('Erro de conexao'); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    const token = sessionStorage.getItem('userTokenAccess');
    fetch(`${masterPath.url}/admin/dashboard/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) window.location.reload();
        else { alert('Erro ao atualizar'); setRefreshing(false); }
      })
      .catch(() => { alert('Erro de conexao'); setRefreshing(false); });
  }, []);

  return { data, loading, error, refreshing, refresh, lastUpdated: data?.lastUpdated };
}
