const url = 'http://localhost:5000/api/v1';
const header = {
    'Content-Type': 'application/json',
    'axway-token': '',
    'axway-session': ''
};
let isLoggedIn = false;

export const AutomatorAPI = {
    getLoginStatus: () => {
        return isLoggedIn;
    },
    login: (user, pwd, server, port) => {
        const data = { user, pwd, server, port };
        console.log('data', data);
        return fetch(url + '/login', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: header
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return res;
            }
        }).then(response => {
            if (response.status !== 500) {
                console.log('Success:-----login-----', JSON.stringify(response));
                header['axway-token'] = response.data.token;
                header['axway-session'] = response.data.session;
                isLoggedIn = true;
            }
        })
            .catch(error => console.error('Error:-----login-----', error));
    },
    getGraphs: () => {
        if (isLoggedIn) {
            return fetch(url + '/graphs', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getGraphs-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getGraphs-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    getArchives: () => {
        if (isLoggedIn) {
            return fetch(url + '/archives', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getArchives-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getArchives-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    getGraphInfo: () => {
        if (isLoggedIn) {
            fetch(url + '/graphDefinition/EB0000000013', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getGraphInfo-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getGraphInfo-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    getArchiveInfo: () => {
        if (isLoggedIn) {
            return fetch(url + '/graphDefinition/EC0000000008', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getArchiveInfo-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getArchiveInfo-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    getGraphicObjectsData: () => {
        if (isLoggedIn) {
            return fetch(url + '/graph/EB0000000013', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getGraphicObjectsData-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getGraphicObjectsData-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    getListOfGraphicObjectsData: () => {
        if (isLoggedIn) {
            return fetch(url + '/graph/EB0000000013/AP0000000002', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getListOfGraphicObjectsData-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getListOfGraphicObjectsData-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    getJobDefinition: () => {
        if (isLoggedIn) {
            return fetch(url + '/graph/EB0000000013/JO0000000149', {
                method: 'GET',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----getJobDefinition-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----getJobDefinition-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    deleteGraph: () => {
        if (isLoggedIn) {
            return fetch(url + '/graph/EB0000000012', {
                method: 'DELETE',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----deleteGraph-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----deleteGraph-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    deleteJob: () => {
        if (isLoggedIn) {
            return fetch(url + '/graph/EB0000000007/JO0000000093', {
                method: 'DELETE',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----deleteJob-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----deleteJob-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    deleteAppOrXgraph: () => {
        if (isLoggedIn) {
            return fetch(url + '/graph/EB0000000013/AP0000000001', {
                method: 'DELETE',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----deleteAppOrXgraph-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----deleteAppOrXgraph-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    deleteJobFromApp: () => {
        if (isLoggedIn) {
            return fetch(url + '/job/EB0000000013/AP0000000002/JO0000000150', {
                method: 'DELETE',
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----deleteJobFromApp-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----deleteJobFromApp-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    createNewGraph: () => {
        if (isLoggedIn) {
            const data = {
                "id_key": "new",
                "v_ename": "job-type33",
                "n_ptype": "",
                "t1_pstart": "0000",
                "t2_pend": "992359",
                "f_chvok": "0",
                "id_plng": "PL0000000002",
                "id_user": "US0000000004",
                "id_agent": "AG0000000001",
                "f_exitc": "1",
                "f_exitl": "0",
                "f_sndalr": "0",
                "n_severity": "50",
                "v_jobd": "",
                "vb_jobd": "",
                "v_jobq": "",
                "vb_jobq": "",
                "n_histo": "7",
                "v_path": "",
                "f_joblog": "2",
                "f_killend": "0",
                "f_declench": "0",
                "f_sendstat": "0",
                "f_bloqplan": "0",
                "f_lvl_err": "0",
                "t2_hdepsuc": "",
                "f_depsuc": "1",
                "v_desc": "",
                "v_urldoc": "",
                "n_evttype": "0",
                "f_keep_exec": "0",
                "id_dsrv": "DS0000000001",
                "id_xpm_dsrv": "",
                "id_xpm_cnxobj": "",
                "v_msg2addkey": "",
                "v_msg2appcode": ""
            };
            return fetch(url + '/graphDefinition/new', {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----createNewGraph-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----createNewGraph-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    updateGraph: () => {
        if (isLoggedIn) {
            const data = {
                "id_key": "EB0000000003",
                "v_ename": "Chart3",
                "n_ptype": "",
                "t1_pstart": "0000",
                "t2_pend": "992359",
                "f_chvok": "0",
                "id_plng": "PL0000000002",
                "id_user": "US0000000004",
                "id_agent": "AG0000000001",
                "f_exitc": "1",
                "f_exitl": "0",
                "f_sndalr": "0",
                "n_severity": "50",
                "v_jobd": "",
                "vb_jobd": "",
                "v_jobq": "",
                "vb_jobq": "",
                "n_histo": "7",
                "v_path": "",
                "f_joblog": "2",
                "f_killend": "0",
                "f_declench": "0",
                "f_sendstat": "0",
                "f_bloqplan": "0",
                "f_lvl_err": "0",
                "t2_hdepsuc": "",
                "f_depsuc": "1",
                "v_desc": "",
                "v_urldoc": "",
                "n_evttype": "0",
                "f_keep_exec": "0",
                "id_dsrv": "DS0000000001",
                "id_xpm_dsrv": "",
                "id_xpm_cnxobj": "",
                "v_msg2addkey": "",
                "v_msg2appcode": ""
            };
            return fetch(url + '/graphDefinition/EB0000000003', {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----updateGraph-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----updateGraph-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    createNewAppOrXGraph: () => {
        if (isLoggedIn) {
            const data = {
                "type": "0",
                "v_desc": "desc11",
                "xywh": "320 130 30 30",
                "f_lpos": "1",
                "f_pertype": "1",
                "n_perfreq": "0",
                "f_cycle": "0",
                "v_cycle": "000000",
                "t2_atearly": "000000",
                "t2_atlater": "992359",
                "t2_hdepsuc": "000000",
                "f_herit": "1",
                "f_mode": "1",
                "f_depsuc": "1",
                "f_lvl_err": "0",
                "id_plng": "PL0000000002",
                "id_user": "US0000000001",
                "id_agent": "AG0000000001",
                "v_jobd": "",
                "vb_jobd": "",
                "v_jobq": "",
                "vb_jobq": "",
                "v_aname": "job22"
            };
            return fetch(url + '/graphDefinition/EB0000000013/new', {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----createNewAppOrXGraph-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----createNewAppOrXGraph-----', error));
        } else {
            console.log('Please Log In');
        }
    },
    updateAppOrXGraph: () => {
        if (isLoggedIn) {
            const data = {
                "type": "0",
                "v_desc": "descapp1",
                "xywh": "320 130 30 30",
                "f_lpos": "1",
                "f_pertype": "1",
                "n_perfreq": "0",
                "f_cycle": "0",
                "v_cycle": "000000",
                "t2_atearly": "000000",
                "t2_atlater": "992359",
                "t2_hdepsuc": "000000",
                "f_herit": "1",
                "f_mode": "1",
                "f_depsuc": "1",
                "f_lvl_err": "0",
                "id_plng": "PL0000000002",
                "id_user": "US0000000001",
                "id_agent": "AG0000000001",
                "v_jobd": "",
                "vb_jobd": "",
                "v_jobq": "",
                "vb_jobq": "",
                "v_aname": "job111"
            };
            return fetch(url + '/graphDefinition/EB0000000013/AP0000000008', {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: header
            }).then(res => res.json())
                .then(response => {
                    console.log('Success:-----updateAppOrXGraph-----', JSON.stringify(response));
                })
                .catch(error => console.error('Error:-----updateAppOrXGraph-----', error));
        } else {
            console.log('Please Log In');
        }
    },
}

