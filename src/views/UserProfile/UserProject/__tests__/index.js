import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import UserProject from '../index';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';

const initialState = {
};

describe('<UserProject />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const data = [];
    const headers = [];
    const wrapper = shallow(
        <Provider
            store={store}
        >
            <UserProject>
                <Table
                    data={data}
                    headers={headers}
                    keyExtractor={() => {}}
                />
                <Modal
                    closeOnEscape
                    onClose={() => {}}
                >
                    <ModalHeader
                        title="Header"
                    />
                    <ModalBody />
                </Modal>
            </UserProject>
        </Provider>,
    );

    it('renders properly with Table and Modal', () => {
        expect(wrapper.length).toEqual(1);
    });
});
