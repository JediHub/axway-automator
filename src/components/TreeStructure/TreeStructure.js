import React from 'react';

export default class TreeStructure extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log(this);
        function handleIconButton(getId) {
            console.log('handleIconButton', getId);
        }
        function handleMoreButton(getId) {
            console.log('handleMoreButton', getId);
        }
        return (
            this.props.data.map((ele) => {
                var name = ele.v_ename;
                var id = ele.id_key;
                return (
                    <div>
                        <span>
                            <button type="button" className="btn btn-default btn-lg" style={{ border: "none" }} onClick={() => handleIconButton(id)}>
                                <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                            </button>
                        </span>
                        <span className="" key={id}>{name}</span>
                        <button type="button" className="btn btn-default btn-lg" style={{ border: "none" }} onClick={() => handleMoreButton(id)}>
                            <span className="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>
                        </button>
                    </div >
                );
            })
        );
    }
}